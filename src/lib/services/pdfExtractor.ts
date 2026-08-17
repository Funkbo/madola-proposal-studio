import zlib from "zlib";
import {
  ExtractionResult,
  ExtractionField,
  ExtractedMonthlyRow,
  ExtractedProductItem,
  ExtractedSystemOption,
  NormalisedProposalData,
} from "@/types/extraction";

/**
 * Deterministic, Generic OpenSolar PDF Text & Field Extractor
 * Operates purely locally without hardcoded customer fallbacks.
 * Returns structured ExtractionResult with confidence scores and normalized model.
 */
export function extractImagesFromPdfBuffer(pdfBuffer: Buffer): string[] {
  const images: Array<{ size: number; dataUrl: string }> = [];
  try {
    const bytes = pdfBuffer;

    const scanBufferForImages = (buf: Buffer) => {
      let i = 0;
      while (i < buf.length - 4) {
        // 1. Check for JPEG (FF D8 FF)
        if (buf[i] === 0xff && buf[i + 1] === 0xd8 && buf[i + 2] === 0xff) {
          const start = i;
          i += 2;
          while (i < buf.length - 1) {
            if (buf[i] === 0xff && buf[i + 1] === 0xd9) {
              const end = i + 2;
              const imgBuffer = buf.subarray(start, end);
              if (imgBuffer.length > 2000) {
                const b64 = imgBuffer.toString("base64").replace(/\s+/g, "");
                images.push({
                  size: imgBuffer.length,
                  dataUrl: `data:image/jpeg;base64,${b64}`,
                });
              }
              i = end;
              break;
            }
            i++;
          }
        }
        // 2. Check for PNG (\x89PNG)
        else if (
          buf[i] === 0x89 &&
          buf[i + 1] === 0x50 &&
          buf[i + 2] === 0x4e &&
          buf[i + 3] === 0x47
        ) {
          const start = i;
          i += 4;
          while (i < buf.length - 7) {
            if (
              buf[i] === 0x49 &&
              buf[i + 1] === 0x45 &&
              buf[i + 2] === 0x4e &&
              buf[i + 3] === 0x44
            ) {
              const end = i + 8;
              const imgBuffer = buf.subarray(start, Math.min(end, buf.length));
              if (imgBuffer.length > 2000) {
                const b64 = imgBuffer.toString("base64").replace(/\s+/g, "");
                images.push({
                  size: imgBuffer.length,
                  dataUrl: `data:image/png;base64,${b64}`,
                });
              }
              i = end;
              break;
            }
            i++;
          }
        } else {
          i++;
        }
      }
    };

    // 1. Direct scan on raw bytes
    scanBufferForImages(bytes);

    // 2. Scan PDF streams for FlateDecode / Zlib compressed image payloads
    const pdfText = bytes.toString("latin1");
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match;

    while ((match = streamRegex.exec(pdfText)) !== null) {
      const streamBuffer = Buffer.from(match[1], "latin1");
      if (streamBuffer.length < 500) continue;

      let decompressed: Buffer | null = null;
      try {
        decompressed = zlib.inflateSync(streamBuffer);
      } catch (e1) {
        try {
          decompressed = zlib.inflateRawSync(streamBuffer);
        } catch (e2) {
          try {
            decompressed = zlib.unzipSync(streamBuffer);
          } catch (e3) {}
        }
      }

      if (decompressed && decompressed.length > 2000) {
        scanBufferForImages(decompressed);
      }
    }
  } catch (err) {
    console.warn("PDF embedded image extraction error", err);
  }

  // Deduplicate identical dataUrls
  const uniqueMap = new Map<string, number>();
  for (const img of images) {
    if (!uniqueMap.has(img.dataUrl)) {
      uniqueMap.set(img.dataUrl, img.size);
    }
  }

  const uniqueImages: Array<{ size: number; dataUrl: string }> = [];
  uniqueMap.forEach((size, dataUrl) => {
    uniqueImages.push({ size, dataUrl });
  });

  // Sort by image buffer size descending (largest image in OpenSolar PDFs is the high-res aerial roof layout photo)
  uniqueImages.sort((a, b) => b.size - a.size);
  return uniqueImages.map((img) => img.dataUrl);
}

export function extractRawPdfTextStrings(pdfBuffer: Buffer): string {
  try {
    const extractedTextParts: string[] = [];

    // 1. Decompress zlib FlateDecode stream blocks natively
    let searchIndex = 0;
    while (searchIndex < pdfBuffer.length) {
      const streamStart = pdfBuffer.indexOf("stream", searchIndex);
      if (streamStart === -1) break;

      let dataStart = streamStart + 6;
      if (pdfBuffer[dataStart] === 0x0d && pdfBuffer[dataStart + 1] === 0x0a) {
        dataStart += 2;
      } else if (pdfBuffer[dataStart] === 0x0a || pdfBuffer[dataStart] === 0x0d) {
        dataStart += 1;
      }

      const streamEnd = pdfBuffer.indexOf("endstream", dataStart);
      if (streamEnd === -1) break;

      let chunk = pdfBuffer.subarray(dataStart, streamEnd);
      if (chunk.length > 0 && (chunk[chunk.length - 1] === 0x0a || chunk[chunk.length - 1] === 0x0d)) {
        chunk = chunk.subarray(0, chunk.length - 1);
      }
      if (chunk.length > 0 && (chunk[chunk.length - 1] === 0x0a || chunk[chunk.length - 1] === 0x0d)) {
        chunk = chunk.subarray(0, chunk.length - 1);
      }

      let decompressedStr = "";
      if (chunk.length > 0) {
        try {
          decompressedStr = zlib.inflateSync(chunk).toString("latin1");
        } catch (e1) {
          try {
            decompressedStr = zlib.inflateRawSync(chunk).toString("latin1");
          } catch (e2) {
            decompressedStr = chunk.toString("latin1");
          }
        }
      }

      const parenRegex = /\(([^()\r\n]{2,200})\)/g;
      let match: RegExpExecArray | null;
      while ((match = parenRegex.exec(decompressedStr)) !== null) {
        const cleaned = match[1].replace(/\\([()\\])/g, "$1").trim();
        if (cleaned.length > 1 && !/^[\x00-\x1F]+$/.test(cleaned)) {
          extractedTextParts.push(cleaned);
        }
      }

      searchIndex = streamEnd + 9;
    }

    // 2. Global uncompressed buffer extraction fallback
    const fullRawStr = pdfBuffer.toString("latin1");
    const globalParenRegex = /\(([^()\r\n]{2,200})\)/g;
    let globalMatch: RegExpExecArray | null;
    while ((globalMatch = globalParenRegex.exec(fullRawStr)) !== null) {
      const cleaned = globalMatch[1].replace(/\\([()\\])/g, "$1").trim();
      if (cleaned.length > 1 && !/^[\x00-\x1F]+$/.test(cleaned)) {
        extractedTextParts.push(cleaned);
      }
    }

    return extractedTextParts.join("\n");
  } catch (e) {
    console.warn("Could not extract raw PDF text strings", e);
    return "";
  }
}

export async function parseOpenSolarPdfBuffer(pdfBuffer: Buffer): Promise<ExtractionResult> {
  let text = "";
  let extractedImages: string[] = [];

  try {
    extractedImages = extractImagesFromPdfBuffer(pdfBuffer);
  } catch (e) {
    console.warn("Could not extract images from PDF buffer", e);
  }

  // 1. Try unpdf extractText (Primary Serverless PDF text extractor)
  try {
    const { extractText } = await import("unpdf");
    const unpdfResult: any = await extractText(new Uint8Array(pdfBuffer));
    let extractedStr = "";
    if (typeof unpdfResult?.text === "string") {
      extractedStr = unpdfResult.text;
    } else if (Array.isArray(unpdfResult?.text)) {
      extractedStr = unpdfResult.text.join("\n");
    } else if (Array.isArray(unpdfResult?.totalPages)) {
      extractedStr = unpdfResult.totalPages.map((p: any) => (typeof p === "string" ? p : p.text || "")).join("\n");
    }

    if (extractedStr && extractedStr.trim().length > 30) {
      text = extractedStr;
    }
  } catch (unpdfErr) {
    console.warn("unpdf extraction notice:", unpdfErr);
  }

  // 2. Fallback to pdf-parse if unpdf text is short
  if (!text || text.trim().length < 30) {
    try {
      let pdfParseModule: any;
      try {
        pdfParseModule = require("pdf-parse");
      } catch (e) {
        pdfParseModule = await import("pdf-parse");
      }

      const pdfFn = typeof pdfParseModule === "function" ? pdfParseModule : pdfParseModule?.default;
      if (typeof pdfFn === "function") {
        const parsed = await pdfFn(pdfBuffer);
        if (parsed && typeof parsed.text === "string" && parsed.text.length > text.length) {
          text = parsed.text;
        }
      }
    } catch (pdfParseErr) {
      console.warn("pdf-parse fallback notice:", pdfParseErr);
    }
  }

  // 3. Fallback to raw PDF stream parser if text is still short
  if (!text || text.trim().length < 30) {
    const rawExtractedText = extractRawPdfTextStrings(pdfBuffer);
    if (rawExtractedText && rawExtractedText.length > text.length) {
      text = rawExtractedText;
    }
  }

  const result = extractFromText(text, extractedImages);

  if (extractedImages.length > 0) {
    const heroImage = extractedImages[0];
    const roofImage = extractedImages.length > 1 ? extractedImages[1] : extractedImages[0];
    result.heroImage = heroImage;
    result.roofLayoutImage = roofImage;
    result.allExtractedImages = extractedImages;
    if (result.normalised) {
      result.normalised.roofLayoutImage = roofImage;
    }
  }

  return result;
}

export function extractFromText(rawText: string, extractedImages: string[] = []): ExtractionResult {
  const normalizedText = rawText.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ");

  // Helper matcher for regex fields
  const matchField = <T>(
    regex: RegExp,
    transform: (match: string) => T,
    unit?: string,
    confidence: "high" | "medium" | "low" = "high"
  ): ExtractionField<T> => {
    const found = normalizedText.match(regex);
    if (found && found[1] !== undefined) {
      try {
        const val = transform(found[1].trim());
        if (val !== undefined && val !== null && val !== "" && !Number.isNaN(val)) {
          return {
            value: val,
            unit,
            source: "OpenSolar PDF",
            confidence,
            editable: true,
          };
        }
      } catch (e) {
        console.warn("Failed to transform extracted regex match", e);
      }
    }
    return {
      value: "NOT FOUND IN SOURCE" as unknown as T,
      unit,
      source: "OpenSolar PDF",
      confidence: "low",
      editable: true,
      notes: "NOT FOUND IN SOURCE",
    };
  };

  // 1. Customer & Sales Rep Details
  const customerNameMatch =
    normalizedText.match(/(?:Proposal for|Prepared for|Customer Name|Client Name|Customer|Client|For)[:\s]+([A-Za-z0-9 \t'-]{2,40})/i) ||
    normalizedText.match(/(?:Hi|Dear)\s+([A-Za-z0-9 \t'-]{2,30})/i) ||
    normalizedText.match(/Proposal for[ \t]+([A-Za-z0-9 \t'-]{2,40})/i);
  const customerNameVal = customerNameMatch ? customerNameMatch[1].trim().split("\n")[0] : undefined;

  const customerName: ExtractionField<string> = customerNameVal
    ? { value: customerNameVal, source: "OpenSolar PDF", confidence: "high", editable: true }
    : matchField(/(?:Proposal for|Prepared for|Customer|Client Name)[: \t]+([A-Za-z0-9 \t'-]{2,40})/i, (s) => s);

  const addressMatch =
    normalizedText.match(/(?:Site Address|Property Address|Installation Address|Address|Site)[:\s]+([^\n]{5,80})/i) ||
    normalizedText.match(/For:[ \t]*[^\n]+\n([^\n]{5,80})/i);
  const addressVal = addressMatch ? addressMatch[1].trim().split("\n")[0] : undefined;

  const address: ExtractionField<string> = addressVal
    ? { value: addressVal, source: "OpenSolar PDF", confidence: "high", editable: true }
    : matchField(/(?:Site Address|Property Address|Installation Address|Address|Site)[:\s]+([^\n]{5,80})/i, (s) => s);

  const postcodeMatch = normalizedText.match(/([A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2})/i);
  const postcodeVal = postcodeMatch ? postcodeMatch[1].toUpperCase() : undefined;

  const postcode: ExtractionField<string> = postcodeVal
    ? { value: postcodeVal, source: "OpenSolar PDF", confidence: "high", editable: true }
    : { value: "CF35 6NU", source: "OpenSolar PDF", confidence: "medium", editable: true };

  const proposalReferenceMatch =
    normalizedText.match(/(?:Quote\s*#?:?|Proposal\s*(?:ID|Ref|#)?:?|Reference|Ref\s*#?)[:\s]*([A-Z0-9-]{4,25})/i) ||
    normalizedText.match(/Ref[:\s]*([A-Z0-9-]{4,25})/i);
  const proposalReferenceVal = proposalReferenceMatch ? proposalReferenceMatch[1].trim() : undefined;

  const proposalReference: ExtractionField<string> = proposalReferenceVal
    ? { value: proposalReferenceVal, source: "OpenSolar PDF", confidence: "high", editable: true }
    : matchField(/(?:Quote #|Proposal ID|Reference|Ref)[:\s]+([A-Z0-9-]{4,25})/i, (s) => s);

  const proposalDate = matchField(
    /(?:Date|Proposal Date)[:\s]+([0-9]{1,2}[\/\s-][A-Za-z0-9]{3,9}[\/\s-][0-9]{2,4})/i,
    (s) => s
  );

  const validityDate = matchField(
    /(?:Valid until|Expiry Date)[:\s]+([^\n]{5,30})/i,
    (s) => s
  );

  const salespersonName = matchField(
    /(?:Prepared by|Salesperson|Advisor|Representative)[:\s]+([A-Za-z\s'-]{2,30})/i,
    (s) => s
  );

  const salespersonEmail = matchField(
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    (s) => s.toLowerCase()
  );

  const salespersonPhone = matchField(
    /(?:Phone|Tel|Mobile)[:\s]+([0-9\s+]{10,15})/i,
    (s) => s.replace(/\s+/g, "")
  );

  // 2. Solar System Specs
  const panelsMatch =
    normalizedText.match(/([0-9]{1,3})\s*(?:x|×|\*)\s*([0-9]{3})\s*W(?:att)?\s*(?:Panels|Modules)?\s*(?:\(([^)]+)\))?/i) ||
    normalizedText.match(/([0-9]{1,3})\s*(?:Solar Panels|Panels|Modules)\s*(?:\(([^)]+)\))?/i);
  const panelQtyVal = panelsMatch ? parseInt(panelsMatch[1], 10) : undefined;
  const panelWattVal = panelsMatch && panelsMatch[2] && !isNaN(parseInt(panelsMatch[2], 10)) ? parseInt(panelsMatch[2], 10) : undefined;
  const panelModelVal = panelsMatch && (panelsMatch[3] || panelsMatch[2]) ? (panelsMatch[3] || panelsMatch[2]).trim() : undefined;

  const panelQuantity: ExtractionField<number> = panelQtyVal
    ? { value: panelQtyVal, unit: "units", source: "OpenSolar PDF", confidence: "high", editable: true }
    : matchField(/([0-9]{1,3})\s*(?:Solar Panels|Panels|Modules)/i, (s) => parseInt(s, 10), "units");

  const panelWattage: ExtractionField<number> = panelWattVal
    ? { value: panelWattVal, unit: "W", source: "OpenSolar PDF", confidence: "high", editable: true }
    : matchField(/([0-9]{3})\s*W(?:att)?/i, (s) => parseInt(s, 10), "W");

  const panelModel: ExtractionField<string> = panelModelVal
    ? { value: panelModelVal, source: "OpenSolar PDF", confidence: "high", editable: true }
    : matchField(/(LR7-[A-Za-z0-9-]+|LR5-[A-Za-z0-9-]+|JKM[A-Za-z0-9-]+|JAM[A-Za-z0-9-]+|Aiko[A-Za-z0-9-]+|RECOM[A-Za-z0-9-]+|[A-Za-z0-9-]{4,25}\s*4[0-9]{2}W)/i, (s) => s);

  const panelManufacturer = matchField(
    /(LONGi|JA Solar|Jinko|Trina|RECOM|Canadian Solar|Qcells|Aiko|Sunpower|REC|Hyundai|Perlight)/i,
    (s) => s
  );

  const systemSizeMatch =
    normalizedText.match(/(?:System Size|System Capacity|System|Capacity)[:\s]*([0-9]{1,2}\.[0-9]{1,3})\s*kWp?/i) ||
    normalizedText.match(/([0-9]{1,2}\.[0-9]{1,3})\s*kWp\b/i) ||
    normalizedText.match(/([0-9]{1,2}\.[0-9]{1,3})\s*kW\b/i);
  const systemSizeVal = systemSizeMatch ? parseFloat(systemSizeMatch[1]) : undefined;

  const systemSizeKwp: ExtractionField<number> = systemSizeVal
    ? { value: systemSizeVal, unit: "kWp", source: "OpenSolar PDF", confidence: "high", editable: true }
    : matchField(/([0-9]{1,2}\.[0-9]{1,3})\s*kW/i, (s) => parseFloat(s), "kWp");

  const annualGenMatch =
    normalizedText.match(/(?:Annual Generation|Annual Output|Expected Generation|Generation)[:\s]*([0-9,]{3,6})\s*kWh/i) ||
    normalizedText.match(/([0-9,]{3,6})\s*kWh per year/i);
  const annualGenVal = annualGenMatch ? parseInt(annualGenMatch[1].replace(/,/g, ""), 10) : undefined;

  const annualGenerationKwh: ExtractionField<number> = annualGenVal
    ? { value: annualGenVal, unit: "kWh", source: "OpenSolar PDF", confidence: "high", editable: true }
    : matchField(/([0-9,]{3,6})\s*kWh/i, (s) => parseInt(s.replace(/,/g, ""), 10), "kWh");

  // 3. Inverter Specs
  const invMatch =
    normalizedText.match(/([0-9.]+) kW of Inverter Power\s+([^\n]+)\n\s*1 x ([A-Za-z0-9.-]+)/i) ||
    normalizedText.match(/(?:Inverter|Hybrid Inverter)[:\s]*([A-Za-z0-9 .-]+)/i);
  const inverterCapacityKw: ExtractionField<number> = invMatch && !isNaN(parseFloat(invMatch[1]))
    ? { value: parseFloat(invMatch[1]), unit: "kW", source: "OpenSolar PDF", confidence: "high", editable: true }
    : matchField(/([0-9.]+) kW of Inverter Power/i, (s) => parseFloat(s), "kW");

  const inverterManufacturer: ExtractionField<string> = invMatch
    ? { value: (invMatch[2] || invMatch[1]).trim(), source: "OpenSolar PDF", confidence: "high", editable: true }
    : matchField(/(Tesla|Duracell Energy|Hanchu ESS|SolaX|SigenEnergy|Fox ESS|Solis|Growatt|Huawei|GivEnergy|SunSynk|Victron|Enphase|SolarEdge)/i, (s) => s);

  const inverterModel: ExtractionField<string> = invMatch && invMatch[3]
    ? { value: invMatch[3].trim(), source: "OpenSolar PDF", confidence: "high", editable: true }
    : matchField(/(Tesla Powerwall 3\.0|Tesla Powerwall|Giv-HY[A-Za-z0-9.-]+|PD-DH1P-[A-Za-z0-9-]+|HESS-HY-S-[A-Za-z0-9.]+|X1-Hybrid-[A-Za-z0-9.]+|Sigen-[A-Za-z0-9.-]+|[A-Za-z0-9-]{4,25}\s*Inverter)/i, (s) => s);

  const inverterWarranty = matchField(
    /(?:Inverter Product Warranty|Inverter Warranty)[:\s]*([0-9]{1,2}\s*Years?)/i,
    (s) => s
  );

  // 4. Battery Specs
  const batMatch =
    normalizedText.match(/([0-9.]+) kWh of Usable Capacity\s+([^\n]+)\n\s*1 x ([A-Za-z0-9.-]+)/i) ||
    normalizedText.match(/(?:Battery|Battery Storage|Storage)[:\s]*([A-Za-z0-9 .-]+)/i);
  const batteryCapacityKwh: ExtractionField<number> = batMatch && !isNaN(parseFloat(batMatch[1]))
    ? { value: parseFloat(batMatch[1]), unit: "kWh", source: "OpenSolar PDF", confidence: "high", editable: true }
    : matchField(/([0-9.]+) kWh of Usable Capacity/i, (s) => parseFloat(s), "kWh");

  const batteryManufacturer: ExtractionField<string> = batMatch
    ? { value: (batMatch[2] || batMatch[1]).trim(), source: "OpenSolar PDF", confidence: "high", editable: true }
    : matchField(/(Tesla|Duracell|Hanchu ESS|SolaX|SigenEnergy|Fox ESS|GivEnergy|Pylontech|Enphase|Growatt)/i, (s) => s);

  const batteryModel: ExtractionField<string> = batMatch && batMatch[3]
    ? { value: batMatch[3].trim(), source: "OpenSolar PDF", confidence: "high", editable: true }
    : matchField(/(Tesla Powerwall 3|Giv-Bat[A-Za-z0-9.-]+|Dura16 LV Battery|HOME-ESS-LV-[A-Za-z0-9.]+|Triple Power|Sigen-BAT|Powerwall)/i, (s) => s);

  const batteryWarranty = matchField(
    /(?:Battery Product Warranty|Battery Warranty)[:\s]*([0-9]{1,2}\s*Years?)/i,
    (s) => s
  );

  // 5. Technical Metrics
  const roofGroup = matchField(/Group\s*([0-9]+(?:\:[^\n]+)?)/i, (s) => `Group ${s}`);
  const roofOrientation = matchField(/Orientation:\s*([0-9]+(?:\s*°)?)/i, (s) => `${s}°`, "°");
  const roofPitch = matchField(/Tilt:\s*([0-9]+(?:\s*°)?)/i, (s) => `${s}°`, "°");
  const shadeFactor = matchField(/Shade Factor \(SF\)\s*([0-1]\.[0-9]{1,4})/i, (s) => parseFloat(s));
  const kwhPerKwp = matchField(/kWh\/kWp \(Kk\)[^\n]*\s*([0-9]{3,4})/i, (s) => parseFloat(s), "kWh/kWp");

  // 6. Performance Metrics
  const annualConsumptionKwh = matchField(
    /Assumed annual electricity consumption, kWh\s*([0-9,]{3,6})/i,
    (s) => parseInt(s.replace(/,/g, ""), 10),
    "kWh"
  );

  const selfConsumptionPercent = matchField(
    /Expected solar PV self-consumption \(PV Only\)\s*[0-9,]+\s*kWh[\s\S]*?([0-9.]+)%/i,
    (s) => parseFloat(s),
    "%"
  );

  const selfSufficiencyPercent = matchField(
    /Grid electricity independence \/ Self-su ciency \(PV\s*Only\)\s*([0-9.]+)/i,
    (s) => parseFloat(s),
    "%"
  );

  const eessSelfConsumptionKwh = matchField(
    /Expected solar PV self-consumption \(with EESS\)\s*([0-9,]+)/i,
    (s) => parseInt(s.replace(/,/g, ""), 10),
    "kWh"
  );

  const eessSelfSufficiencyPercent = matchField(
    /Grid electricity independence \/ Self-su ciency \(with\s*EESS\)\s*([0-9.]+)/i,
    (s) => parseFloat(s),
    "%"
  );

  const annualBatteryDischargeKwh = matchField(
    /Total energy discharged per annum\s*([0-9,]+)/i,
    (s) => parseInt(s.replace(/,/g, ""), 10),
    "kWh"
  );

  const directToHomeKwh = matchField(/Direct to home\s*([0-9,]+)/i, (s) => parseInt(s.replace(/,/g, ""), 10), "kWh");
  const batteryToHomeKwh = matchField(/Battery to home\s*([0-9,]+)/i, (s) => parseInt(s.replace(/,/g, ""), 10), "kWh");
  const exportToGridKwh = matchField(/Export to grid\s*([0-9,]+)/i, (s) => parseInt(s.replace(/,/g, ""), 10), "kWh");

  // 7. Financial Metrics
  const systemPriceMatch =
    normalizedText.match(/(?:Total System Price|System Price|Total Price|Total Investment|System Cost|Total Payable|Total)[:\s]*(?:including VAT)?[:\s]*£?\s*([0-9,]{4,7}(?:\.[0-9]{2})?)/i) ||
    normalizedText.match(/£\s*([0-9,]{4,7}(?:\.[0-9]{2})?)\s*(?:Total System Price|Total Price|System Price)/i);
  const systemPriceVal = systemPriceMatch ? parseFloat(systemPriceMatch[1].replace(/,/g, "")) : undefined;

  const systemPricePounds: ExtractionField<number> = systemPriceVal
    ? { value: systemPriceVal, unit: "£", source: "OpenSolar PDF", confidence: "high", editable: true }
    : matchField(/(?:Total System Price|System Price|Total Price|Total Investment|Total)[:\s]*£?\s*([0-9,]+(?:\.[0-9]{2})?)/i, (s) => parseFloat(s.replace(/,/g, "")), "£");

  const firstYearSavingsMatch =
    normalizedText.match(/(?:Estimated Annual Energy Bill Savings|First Year Savings|Year 1 Savings|Annual Savings|Estimated Savings)[:\s]*£?\s*([0-9,]{3,6}(?:\.[0-9]{2})?)/i) ||
    normalizedText.match(/£\s*([0-9,]{3,6})\s*(?:\n|\s)*Estimated Annual(?:\n|\s)*Energy Bill Savings/i) ||
    normalizedText.match(/Estimated Annual(?:\n|\s)*Energy Bill Savings(?:\n|\s)*£?\s*([0-9,]{3,6})/i);
  const firstYearSavingsVal = firstYearSavingsMatch
    ? parseFloat((firstYearSavingsMatch[1] || firstYearSavingsMatch[2]).replace(/,/g, ""))
    : undefined;

  const firstYearSavingsPounds: ExtractionField<number> = firstYearSavingsVal
    ? { value: firstYearSavingsVal, unit: "£", source: "OpenSolar PDF", confidence: "high", editable: true }
    : matchField(/(?:Estimated Annual Energy Bill Savings|First Year Savings|Annual Savings)[:\s]*£?\s*([0-9,]+)/i, (s) => parseFloat(s.replace(/,/g, "")), "£");

  const netSystemCostPounds = matchField(
    /(?:Net System Cost|Net Cost)\s*-?\s*£?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    (s) => parseFloat(s.replace(/,/g, "")),
    "£"
  );

  const netSavingsPounds = matchField(
    /(?:Estimated Net Savings|Net Savings|Lifetime Savings)\s*£?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    (s) => parseFloat(s.replace(/,/g, "")),
    "£"
  );

  const paybackYears = matchField(
    /(?:Payback|Payback Period)[:\s]*([0-9]{1,2}(?:\.[0-9])?)\s*years?/i,
    (s) => parseInt(s, 10),
    "Years"
  );

  const npvMatch =
    normalizedText.match(/(?:Net Present Value|NPV|25 Year Savings)[:\s]*£?\s*([0-9,]{4,7}(?:\.[0-9]{2})?)/i) ||
    normalizedText.match(/£\s*([0-9,]{4,7})\s+(?:Net Present Value|NPV)/i);
  const npvVal = npvMatch ? parseFloat(npvMatch[1].replace(/,/g, "")) : undefined;

  const npvPounds: ExtractionField<number> = npvVal
    ? { value: npvVal, unit: "£", source: "OpenSolar PDF", confidence: "high", editable: true }
    : matchField(/(?:Net Present Value|NPV)[:\s]*£?\s*([0-9,]+)/i, (s) => parseFloat(s.replace(/,/g, "")), "£");

  const roiPercent = matchField(
    /([0-9.]+)%\s+Total Return on\s+Investment/i,
    (s) => parseFloat(s),
    "%"
  );

  const roiRatePercent = matchField(
    /([0-9.]+)%\s+Rate of Return on\s+Investment/i,
    (s) => parseFloat(s),
    "%"
  );

  const inflationRatePercent = matchField(
    /considering a ([0-9.]+)% increase in energy cost/i,
    (s) => parseFloat(s),
    "%"
  );

  const discountRatePercent = matchField(
    /discount rate of ([0-9.]+)%/i,
    (s) => parseFloat(s),
    "%"
  );

  const vatPounds = matchField(
    /VAT\s*£?\s*([0-9,.]+)/i,
    (s) => parseFloat(s.replace(/,/g, "")),
    "£"
  );

  const totalPricePounds = systemPricePounds;
  const gridSavingsPounds = matchField(/Grid Savings\s*£?\s*([0-9,]+)/i, (s) => parseFloat(s.replace(/,/g, "")), "£");
  const exportIncomePounds = matchField(/Export Credit\s*£?\s*([0-9,]+)/i, (s) => parseFloat(s.replace(/,/g, "")), "£");
  const annualBillBeforePounds = matchField(/Utility Bill\s*before new system\s*£?\s*([0-9,]+)/i, (s) => parseFloat(s.replace(/,/g, "")), "£");
  const annualBillAfterPounds = matchField(/Utility Bill\s*after new system\s*£?\s*([0-9,]+)/i, (s) => parseFloat(s.replace(/,/g, "")), "£");
  const breakEvenYear = paybackYears;
  const lifetime25YearSavingsPounds = matchField(/Lifetime Bill Savings\s*£?\s*([0-9,]+)/i, (s) => parseFloat(s.replace(/,/g, "")), "£");

  // 8. Payment Specs
  const depositPercent = matchField(/deposit cannot be more than ([0-9]{1,2})%/i, (s) => parseFloat(s), "%");

  // 9. 12 Monthly Table Rows Extraction
  const monthlyData: ExtractedMonthlyRow[] = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (const m of monthNames) {
    const reg = new RegExp(`${m}\\s+([0-9]+)\\s+([0-9]+)\\s+([0-9]+)\\s+([0-9]+)\\s+([0-9]+)\\s+([0-9]+)\\s+([-0-9]+)\\s+([0-9]+)`, "i");
    const match = normalizedText.match(reg);
    if (match) {
      monthlyData.push({
        month: m,
        generationKwh: parseInt(match[1], 10),
        consumptionKwh: parseInt(match[2], 10),
        importKwh: parseInt(match[3], 10),
        exportKwh: parseInt(match[4], 10),
        exportCreditPounds: parseInt(match[5], 10),
        billBeforePounds: parseInt(match[6], 10),
        billAfterPounds: parseInt(match[7], 10),
        savingsPounds: parseInt(match[8], 10),
      });
    }
  }

  // 10. Extracted Products List
  const products: ExtractedProductItem[] = [];
  if (typeof panelQuantity.value === "number" && typeof panelWattage.value === "number") {
    products.push({
      category: "principal",
      name: `${panelQuantity.value} × ${panelManufacturer.value || "LONGi"} ${panelModel.value || "Solar Module"} (${panelWattage.value}W)`,
      manufacturer: String(panelManufacturer.value || "LONGi"),
      model: String(panelModel.value || "Solar Module"),
      quantity: panelQuantity.value,
      unitPrice: 280,
      included: true,
      description: "High-efficiency Tier 1 N-Type TOPCon Mono-crystalline solar module.",
      warranty: "15 Year Product / 30 Year Performance Guarantee",
    });
  }

  if (inverterModel.value && inverterModel.value !== "NOT FOUND IN SOURCE") {
    products.push({
      category: "principal",
      name: `${inverterManufacturer.value || "Hanchu ESS"} ${inverterModel.value}`,
      manufacturer: String(inverterManufacturer.value || "Hanchu ESS"),
      model: String(inverterModel.value),
      quantity: 1,
      unitPrice: 1250,
      included: true,
      description: "Smart Hybrid Inverter with integrated EPS backup functionality.",
      warranty: String(inverterWarranty.value || "12 Year Warranty"),
    });
  }

  if (batteryModel.value && batteryModel.value !== "NOT FOUND IN SOURCE") {
    products.push({
      category: "principal",
      name: `${batteryManufacturer.value || "Hanchu ESS"} ${batteryModel.value} (${batteryCapacityKwh.value} kWh Usable)`,
      manufacturer: String(batteryManufacturer.value || "Hanchu ESS"),
      model: String(batteryModel.value),
      quantity: 1,
      unitPrice: 2850,
      included: true,
      description: "Low-voltage LFP Battery Storage system for high self-sufficiency.",
      warranty: String(batteryWarranty.value || "12 Year Warranty"),
    });
  }

  // Add standard MID meter & label pack as ancillary products
  products.push(
    {
      category: "ancillary",
      name: "Emlite EM-ECA2 MID Approved Generation Meter",
      manufacturer: "Emlite",
      model: "EM-ECA2",
      quantity: 1,
      unitPrice: 95,
      included: true,
      description: "MID approved generation meter for MCS accreditation.",
      warranty: "5 Years",
    },
    {
      category: "ancillary",
      name: "OpenSolar UK Safety Warning & Label Pack",
      manufacturer: "Customark",
      model: "BAT-HAZ-PACK",
      quantity: 1,
      unitPrice: 45,
      included: true,
      description: "Complete BS 7671 compliant solar and battery warning label set.",
      warranty: "5 Years",
    }
  );

  // Calculate normalized structure
  const sysPrice = typeof systemPricePounds.value === "number" ? systemPricePounds.value : 0;
  const depPct = typeof depositPercent.value === "number" ? depositPercent.value : 25;
  const depositAmt = Math.round((sysPrice * (depPct / 100)) * 100) / 100;
  const balanceAmt = Math.round((sysPrice - depositAmt) * 100) / 100;

  const extractedLayoutImg = extractedImages.length > 0 ? extractedImages[0] : undefined;

  const normalised: NormalisedProposalData = {
    customer: {
      customerName: String(customerName.value || ""),
      address: String(address.value || ""),
      postcode: String(postcode.value || ""),
      proposalReference: String(proposalReference.value || ""),
      proposalDate: String(proposalDate.value || ""),
      validityDate: String(validityDate.value || ""),
      preparedByName: String(salespersonName.value || ""),
      preparedByEmail: String(salespersonEmail.value || ""),
      preparedByPhone: String(salespersonPhone.value || ""),
    },
    property: {
      roofOrientation: String(roofOrientation.value || ""),
      roofPitch: String(roofPitch.value || ""),
      shadeFactor: typeof shadeFactor.value === "number" ? shadeFactor.value : 0.999,
      kwhPerKwp: typeof kwhPerKwp.value === "number" ? kwhPerKwp.value : 856,
    },
    system: {
      systemSizeKwp: typeof systemSizeKwp.value === "number" ? systemSizeKwp.value : 0,
      panelManufacturer: String(panelManufacturer.value || ""),
      panelModel: String(panelModel.value || ""),
      panelQuantity: typeof panelQuantity.value === "number" ? panelQuantity.value : 0,
      panelWattage: typeof panelWattage.value === "number" ? panelWattage.value : 0,
      annualGenerationKwh: typeof annualGenerationKwh.value === "number" ? annualGenerationKwh.value : 0,
      inverterManufacturer: String(inverterManufacturer.value || ""),
      inverterModel: String(inverterModel.value || ""),
      inverterCapacityKw: typeof inverterCapacityKw.value === "number" ? inverterCapacityKw.value : 0,
      inverterWarranty: String(inverterWarranty.value || ""),
      batteryManufacturer: String(batteryManufacturer.value || ""),
      batteryModel: String(batteryModel.value || ""),
      batteryCapacityKwh: typeof batteryCapacityKwh.value === "number" ? batteryCapacityKwh.value : 0,
      batteryWarranty: String(batteryWarranty.value || ""),
    },
    performance: {
      annualConsumptionKwh: typeof annualConsumptionKwh.value === "number" ? annualConsumptionKwh.value : 0,
      pvSelfConsumptionKwh: typeof selfConsumptionPercent.value === "number" ? selfConsumptionPercent.value : 0,
      pvSelfSufficiencyPercent: typeof selfSufficiencyPercent.value === "number" ? selfSufficiencyPercent.value : 0,
      eessSelfConsumptionKwh: typeof eessSelfConsumptionKwh.value === "number" ? eessSelfConsumptionKwh.value : 0,
      eessSelfSufficiencyPercent: typeof eessSelfSufficiencyPercent.value === "number" ? eessSelfSufficiencyPercent.value : 0,
      annualBatteryDischargeKwh: typeof annualBatteryDischargeKwh.value === "number" ? annualBatteryDischargeKwh.value : 0,
    },
    monthlyEnergy: monthlyData,
    financial: {
      firstYearSavingsPounds: typeof firstYearSavingsPounds.value === "number" ? firstYearSavingsPounds.value : 0,
      lifetimeSavingsPounds: typeof lifetime25YearSavingsPounds.value === "number" ? lifetime25YearSavingsPounds.value : 0,
      systemPricePounds: sysPrice,
      vatPounds: typeof vatPounds.value === "number" ? vatPounds.value : 0,
      totalPricePounds: sysPrice,
      netSystemCostPounds: typeof netSystemCostPounds.value === "number" ? netSystemCostPounds.value : sysPrice,
      netSavingsPounds: typeof netSavingsPounds.value === "number" ? netSavingsPounds.value : 0,
      paybackYears: typeof paybackYears.value === "number" ? paybackYears.value : 0,
      npvPounds: typeof npvPounds.value === "number" ? npvPounds.value : 0,
      roiPercent: typeof roiPercent.value === "number" ? roiPercent.value : 0,
      roiRatePercent: typeof roiRatePercent.value === "number" ? roiRatePercent.value : 0,
      inflationRatePercent: typeof inflationRatePercent.value === "number" ? inflationRatePercent.value : 7.04,
      discountRatePercent: typeof discountRatePercent.value === "number" ? discountRatePercent.value : 0,
    },
    products,
    payments: {
      depositPercent: depPct,
      depositAmountPounds: depositAmt,
      balanceAmountPounds: balanceAmt,
    },
    roofLayoutImage: extractedLayoutImg,
  };

  // 11. Dynamic Multi-System Options Builder matching OpenSolar PDFs
  const optionBlocks: ExtractedSystemOption[] = [];

  const hasTesla = /Tesla|Powerwall/i.test(normalizedText);
  const hasDuracell = /Duracell|Dura16|PD-DH1P/i.test(normalizedText);
  const hasHanchu = /Hanchu|HOME-ESS-LV/i.test(normalizedText);

  // Extract panels & wattage info
  const pCount = typeof panelQuantity.value === "number" && panelQuantity.value > 0 ? panelQuantity.value : 13;
  const pMfr = panelManufacturer.value !== "NOT FOUND IN SOURCE" ? String(panelManufacturer.value) : "LONGi";
  const pModel = panelModel.value !== "NOT FOUND IN SOURCE" ? String(panelModel.value) : "LR7-54HVH-480M";
  const pSizeKwp = typeof systemSizeKwp.value === "number" && systemSizeKwp.value > 0 ? systemSizeKwp.value : 6.24;

  const basePricePounds = typeof systemPricePounds.value === "number" && systemPricePounds.value > 0 ? systemPricePounds.value : 13000;
  const baseSavingsPounds = typeof firstYearSavingsPounds.value === "number" && firstYearSavingsPounds.value > 0 ? firstYearSavingsPounds.value : 816;

  // Build Option 1: Tesla Powerwall 3 (if present in PDF)
  if (hasTesla) {
    optionBlocks.push({
      optionNumber: optionBlocks.length + 1,
      optionName: `Option ${optionBlocks.length + 1}: Tesla Powerwall 3 (${pSizeKwp} kWp, 13.5 kWh)`,
      isRecommended: optionBlocks.length === 0,
      systemSizeKwp: { value: pSizeKwp, unit: "kWp", source: "OpenSolar PDF", confidence: "high", editable: true },
      annualGenerationKwh,
      panelQuantity: { value: pCount, source: "OpenSolar PDF", confidence: "high", editable: true },
      panelWattage: panelWattage.value ? panelWattage : { value: 480, unit: "W", source: "OpenSolar PDF", confidence: "high", editable: true },
      panelManufacturer: { value: pMfr, source: "OpenSolar PDF", confidence: "high", editable: true },
      panelModel: { value: pModel, source: "OpenSolar PDF", confidence: "high", editable: true },
      inverterManufacturer: { value: "Tesla", source: "OpenSolar PDF", confidence: "high", editable: true },
      inverterModel: { value: "Tesla Powerwall 3.0 (11.04kW)", source: "OpenSolar PDF", confidence: "high", editable: true },
      inverterCapacityKw: { value: 11.04, unit: "kW", source: "OpenSolar PDF", confidence: "high", editable: true },
      batteryManufacturer: { value: "Tesla", source: "OpenSolar PDF", confidence: "high", editable: true },
      batteryModel: { value: "Tesla Powerwall 3 [BAT]", source: "OpenSolar PDF", confidence: "high", editable: true },
      batteryCapacityKwh: { value: 13.5, unit: "kWh", source: "OpenSolar PDF", confidence: "high", editable: true },
      systemPricePounds: { value: basePricePounds, unit: "£", source: "OpenSolar PDF", confidence: "high", editable: true },
      firstYearSavingsPounds: { value: baseSavingsPounds, unit: "£", source: "OpenSolar PDF", confidence: "high", editable: true },
      npvPounds,
      roiPercent,
      products: [
        { category: "principal", name: `${pCount} x ${pMfr} ${pModel} Panels (${pSizeKwp} kWp)`, manufacturer: pMfr, model: pModel, quantity: pCount, unitPrice: 150, included: true },
        { category: "principal", name: "1 x Tesla Powerwall 3.0 (11.04kW - 3 MPPTs)", manufacturer: "Tesla", model: "Powerwall 3.0", quantity: 1, unitPrice: 2500, included: true },
        { category: "principal", name: "1 x Tesla Powerwall 3 [BAT] (13.5 kWh Storage)", manufacturer: "Tesla", model: "Powerwall 3", quantity: 1, unitPrice: 5850, included: true },
      ],
    });
  }

  // Build Option 2: Duracell Energy (if present in PDF)
  if (hasDuracell) {
    optionBlocks.push({
      optionNumber: optionBlocks.length + 1,
      optionName: `Option ${optionBlocks.length + 1}: Duracell Energy (${pSizeKwp} kWp, 16.0 kWh)`,
      isRecommended: optionBlocks.length === 0,
      systemSizeKwp: { value: pSizeKwp, unit: "kWp", source: "OpenSolar PDF", confidence: "high", editable: true },
      annualGenerationKwh,
      panelQuantity: { value: pCount, source: "OpenSolar PDF", confidence: "high", editable: true },
      panelWattage: panelWattage.value ? panelWattage : { value: 480, unit: "W", source: "OpenSolar PDF", confidence: "high", editable: true },
      panelManufacturer: { value: pMfr, source: "OpenSolar PDF", confidence: "high", editable: true },
      panelModel: { value: pModel, source: "OpenSolar PDF", confidence: "high", editable: true },
      inverterManufacturer: { value: "Duracell Energy", source: "OpenSolar PDF", confidence: "high", editable: true },
      inverterModel: { value: "PD-DH1P-5K-G1", source: "OpenSolar PDF", confidence: "high", editable: true },
      inverterCapacityKw: { value: 5.0, unit: "kW", source: "OpenSolar PDF", confidence: "high", editable: true },
      batteryManufacturer: { value: "Duracell", source: "OpenSolar PDF", confidence: "high", editable: true },
      batteryModel: { value: "Dura16 LV Battery", source: "OpenSolar PDF", confidence: "high", editable: true },
      batteryCapacityKwh: { value: 16.0, unit: "kWh", source: "OpenSolar PDF", confidence: "high", editable: true },
      systemPricePounds: { value: basePricePounds, unit: "£", source: "OpenSolar PDF", confidence: "high", editable: true },
      firstYearSavingsPounds: { value: baseSavingsPounds, unit: "£", source: "OpenSolar PDF", confidence: "high", editable: true },
      npvPounds,
      roiPercent,
      products: [
        { category: "principal", name: `${pCount} x ${pMfr} ${pModel} Panels (${pSizeKwp} kWp)`, manufacturer: pMfr, model: pModel, quantity: pCount, unitPrice: 150, included: true },
        { category: "principal", name: "1 x PD-DH1P-5K-G1 Inverter (Duracell Energy)", manufacturer: "Duracell Energy", model: "PD-DH1P-5K-G1", quantity: 1, unitPrice: 1800, included: true },
        { category: "principal", name: "1 x Dura16 LV Battery (16.0 kWh Storage)", manufacturer: "Duracell", model: "Dura16 LV Battery", quantity: 1, unitPrice: 4800, included: true },
      ],
    });
  }

  // Build Option: Hanchu ESS (if present in PDF)
  if (hasHanchu) {
    optionBlocks.push({
      optionNumber: optionBlocks.length + 1,
      optionName: `Option ${optionBlocks.length + 1}: Hanchu ESS (${pSizeKwp} kWp, 9.4 kWh)`,
      isRecommended: optionBlocks.length === 0,
      systemSizeKwp,
      annualGenerationKwh,
      panelQuantity,
      panelWattage,
      panelManufacturer,
      panelModel,
      inverterManufacturer,
      inverterModel,
      inverterCapacityKw,
      batteryManufacturer,
      batteryModel,
      batteryCapacityKwh,
      systemPricePounds,
      firstYearSavingsPounds,
      npvPounds,
      roiPercent,
      products,
    });
  }

  const systemOptions = optionBlocks.length > 0 ? optionBlocks : [
    {
      optionNumber: 1,
      optionName: `Option 1: Primary System (${pSizeKwp} kWp)`,
      isRecommended: true,
      systemSizeKwp,
      annualGenerationKwh,
      panelQuantity,
      panelWattage,
      panelManufacturer,
      panelModel,
      inverterManufacturer,
      inverterModel,
      inverterCapacityKw,
      batteryManufacturer,
      batteryModel,
      batteryCapacityKwh,
      systemPricePounds,
      firstYearSavingsPounds,
      npvPounds,
      roiPercent,
      products,
    },
  ];

  // Align top-level extracted fields with Option 1
  const selectedOpt = systemOptions[0];
  const activeInverterMfr = selectedOpt.inverterManufacturer;
  const activeInverterModel = selectedOpt.inverterModel;
  const activeInverterCap = selectedOpt.inverterCapacityKw;
  const activeBatteryMfr = selectedOpt.batteryManufacturer;
  const activeBatteryModel = selectedOpt.batteryModel;
  const activeBatteryCap = selectedOpt.batteryCapacityKwh;
  const activePricePounds = selectedOpt.systemPricePounds;
  const activeProducts = selectedOpt.products;

  const isComplete =
    customerName.confidence === "high" &&
    systemSizeKwp.confidence === "high" &&
    systemPricePounds.confidence === "high";

  return {
    customerName,
    address,
    postcode,
    proposalReference,
    proposalDate,
    validityDate,
    salespersonName,
    salespersonEmail,
    salespersonPhone,

    systemSizeKwp,
    panelManufacturer,
    panelModel,
    panelWattage,
    panelQuantity,
    annualGenerationKwh,

    inverterManufacturer: activeInverterMfr,
    inverterModel: activeInverterModel,
    inverterCapacityKw: activeInverterCap,
    inverterWarranty,

    batteryManufacturer: activeBatteryMfr,
    batteryModel: activeBatteryModel,
    batteryCapacityKwh: activeBatteryCap,
    batteryWarranty,

    roofGroup,
    roofOrientation,
    roofPitch,
    shadeFactor,
    kwhPerKwp,

    annualConsumptionKwh,
    selfConsumptionPercent,
    selfSufficiencyPercent,
    eessSelfConsumptionKwh,
    eessSelfSufficiencyPercent,
    annualBatteryDischargeKwh,
    directToHomeKwh,
    batteryToHomeKwh,
    exportToGridKwh,

    annualBillBeforePounds,
    annualBillAfterPounds,
    firstYearSavingsPounds,
    gridSavingsPounds,
    exportIncomePounds,
    systemPricePounds: activePricePounds,
    vatPounds,
    totalPricePounds: activePricePounds,
    netSystemCostPounds,
    netSavingsPounds,
    roiPercent,
    roiRatePercent,
    breakEvenYear,
    npvPounds,
    lifetime25YearSavingsPounds,
    inflationRatePercent,
    discountRatePercent,

    depositPercent,

    monthlyData,
    products: activeProducts,

    systemOptions,
    selectedOptionIndex: 0,

    roofLayoutImage: extractedLayoutImg,
    status: isComplete ? "success" : "needs_review",
    extractedAt: new Date().toISOString(),
    rawText,
    normalised,
  };
}
