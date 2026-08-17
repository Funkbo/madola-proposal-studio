import { BlockProposal, ProposalBlock, CalculatedTotals } from "@/types/block-proposal";
import { DEFAULT_ACCREDITATION_LOGOS } from "@/lib/media-library";

export function calculateProposalTotals(proposal: BlockProposal): CalculatedTotals {
  const numKw = parseFloat(proposal.systemSizeKw || "5.4");
  const basePrice = proposal.basePrice || 7950;

  // Extra products sum
  const extraProductsPrice = (proposal.extraProducts || [])
    .filter((p) => p.included)
    .reduce((sum, p) => sum + (p.price || 0), 0);

  // EV Charger sum
  const evChargerPrice = proposal.evCharger && proposal.evCharger.included ? proposal.evCharger.price : 0;

  const subtotal = basePrice + extraProductsPrice + evChargerPrice;
  const vatRate = 0; // 0% VAT for UK residential solar
  const vatAmount = subtotal * vatRate;
  const finalTotal = subtotal + vatAmount;

  // Payment Milestones (25% Deposit, 75% Balance)
  const depositMilestone = proposal.paymentSchedule?.find((m) => m.percentage === 25);
  const depositPercentage = depositMilestone ? depositMilestone.percentage : 25;
  const depositAmount = (finalTotal * depositPercentage) / 100;
  const balanceAmount = finalTotal - depositAmount;

  // Energy & Financial Return Calculations
  const annualGenerationKwh = Math.round(numKw * 920);
  const annualSavings = Math.round(numKw * 265);
  const paybackYears = annualSavings > 0 ? (finalTotal / annualSavings).toFixed(1) : "6.3";

  return {
    basePrice,
    extraProductsPrice,
    evChargerPrice,
    subtotal,
    vatRate,
    vatAmount,
    finalTotal,
    depositAmount,
    balanceAmount,
    annualSavings,
    paybackYears,
    annualGenerationKwh,
  };
}

export function createDefaultProposal(): BlockProposal {
  const blocks: ProposalBlock[] = [
    {
      id: "block-1-cover",
      type: "cover",
      title: "1. Cover",
      order: 1,
      enabled: true,
      data: {
        proposalTitle: "Madola TEMPLATE",
        subtitle: "High-Efficiency Clean Energy Specification",
        heroImage: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
        preparedBy: {
          name: "Neil Parry",
          email: "nparry@madolaenergy.com",
          phone: "+44 (0) 800 123 4567",
          profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        },
        greeting: "Hi ,",
        introText:
          "Thanks for your enquiry and for considering Madola Energy for your solar and battery installation.\n\nWe've prepared this proposal based on what we've discussed, with a system designed around your property, your energy usage and what you're looking to achieve.\n\nInside, you'll find your recommended system, product information, pricing and the next steps if you'd like to move forward.\n\nTake a look through everything, and if you have any questions or want to talk through the options, we'll be happy to help.",
      },
    },
    {
      id: "block-2-why-us",
      type: "why_choose_us",
      title: "2. Why Choose Us?",
      order: 2,
      enabled: true,
      data: {
        heading: "Why Choose Madola?",
        paragraph1:
          "Madola Energy is a leading provider of solar power solutions for businesses and homes across the UK. Since our founding in 2013, we’ve been dedicated to providing high-quality, reliable, and sustainable solar power installations that help our customers save money, reduce their carbon footprint, and make a positive impact on the environment.",
        paragraph2:
          "We are committed to staying at the forefront of new and innovative technologies in the solar power industry, and to deliver tailored solutions that meet the unique needs of each customer.",
        madolaWayHeading: "The Madola way",
        benefits: [
          {
            title: "Certified and accredited",
            desc: "by leading industry organisations, ensuring the highest standards of quality and performance.",
          },
          {
            title: "Free consultation and support",
            desc: "from our team of experts to help you make informed decisions and choose the best solar power solutions for your needs.",
          },
        ],
        closingLine: "Go Solar, with Madola!",
        accreditations: DEFAULT_ACCREDITATION_LOGOS,
      },
    },
    {
      id: "block-3-text-intro",
      type: "text",
      title: "Text",
      order: 3,
      enabled: true,
      data: {
        pillBadge: "Text",
        heading: "Trustpilot review widget",
        isTrustpilot: true,
      },
    },
    {
      id: "block-4-our-work",
      type: "our_work",
      title: "Our Work",
      order: 4,
      enabled: true,
      data: {
        pillBadge: "Our Work",
        description:
          "Madola Energy has installed over 10,000 solar systems since 2013 — more than 100,000 panels across homes, commercial sites and utility-scale projects nationwide.",
        images: [
          {
            url: "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1200&q=80",
            title: "Residential All-Black Solar Installation",
            location: "Surrey, UK",
            type: "Residential",
          },
          {
            url: "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?auto=format&fit=crop&w=800&q=80",
            title: "Solar Canopy Carport & EV Charging Hub",
            location: "Commercial Site, Midlands",
            type: "Carport & EV",
          },
          {
            url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
            title: "Commercial Utility-Scale Rooftop Array",
            location: "Industrial Park, Hampshire",
            type: "Commercial",
          },
          {
            url: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=800&q=80",
            title: "High-Yield Monocrystalline Array with Hybrid Inverter",
            location: "Oxfordshire, UK",
            type: "Solar & Battery",
          },
          {
            url: "https://images.unsplash.com/photo-1592833159155-c62df1b65634?auto=format&fit=crop&w=800&q=80",
            title: "Terracotta In-Roof Integrated Solar Tiles",
            location: "Cotswolds Heritage Build",
            type: "In-Roof Tiles",
          },
        ],
      },
    },
    {
      id: "block-4b-panel-layout",
      type: "panel_layout",
      title: "Panel layout & system output",
      order: 5,
      enabled: true,
      data: {
        pillBadge: "Panel layout",
        heading: "Solar panel layout & system output",
        layoutImage: "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1200&q=80",
      },
    },
    {
      id: "block-5-whats-included",
      type: "whats_included",
      title: "6. What's Included",
      order: 5,
      enabled: true,
      data: {
        items: [
          {
            name: "High-Efficiency Monocrystalline PV Panels",
            brand: "LONGi / Trina Solar",
            spec: "12 × 450W Monocrystalline Modules (5.4 kW total)",
            desc: "All-black aesthetically sleek panels engineered for maximum low-light yield.",
            status: "included",
            image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=400&q=80",
          },
          {
            name: "Lithium Storage Battery System",
            brand: "Hanchu ESS / GivEnergy",
            spec: "9.4 kWh Modular LFP Battery",
            desc: "High-cycle cobalt-free battery with 6000+ lifecycle guarantees and rapid response.",
            status: "included",
            image: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=400&q=80",
          },
          {
            name: "Dual-MPPT Hybrid Inverter",
            brand: "Hanchu ESS / Fox ESS",
            spec: "5.0 kW Hybrid Inverter with Mobile App",
            desc: "Intelligent inverter managing solar generation, battery storage, and grid export.",
            status: "included",
            image: "https://images.unsplash.com/photo-1548611635-b6e7827d7d4a?auto=format&fit=crop&w=400&q=80",
          },
          {
            name: "Complete Scaffolding & Roof Mounting",
            brand: "Schletter / K2 Systems",
            spec: "MCS-012 Approved Roof Mounting Rail",
            desc: "Wind-load tested mounting fixtures and full perimeter safety scaffolding.",
            status: "included",
            image: "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=400&q=80",
          },
          {
            name: "DNO Grid Notification & MCS Certificate",
            brand: "National Grid / ENA",
            spec: "G98/G99 Notification & MCS Certificate",
            desc: "Official grid application, commissioning documentation, and SEG meter registration.",
            status: "included",
            image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80",
          },
        ],
      },
    },
    {
      id: "block-6-ev-charger",
      type: "ev_charger",
      title: "6. Add an EV Charger?",
      order: 6,
      enabled: true,
      data: {
        headline: "Smart Electric Vehicle Charging (Optional)",
        description: "Seamlessly charge your EV directly from excess solar power using an integrated smart charger.",
      },
    },
    {
      id: "block-7-extra-products",
      type: "extra_products",
      title: "7. Extra Equipment & Gateways",
      order: 7,
      enabled: true,
      data: {
        headline: "Optional System Enhancements",
        description: "Select optional accessories to expand backup power capabilities and panel optimization.",
      },
    },
    {
      id: "block-8-next-steps",
      type: "next_steps",
      title: "8. Next Steps & Journey",
      order: 8,
      enabled: true,
      data: {
        steps: [
          { stepNum: 1, title: "Survey & Engineering Design", desc: "Our technical surveyor conducts a physical or 3D aerial survey to finalize panel positioning." },
          { stepNum: 2, title: "DNO Grid Notification & Scheduling", desc: "We submit mandatory DNO documentation to National Grid and confirm your 1-day installation date." },
          { stepNum: 3, title: "1-Day Certified Installation", desc: "Our MCS-accredited solar & electrical team erects scaffolding and installs your complete system." },
          { stepNum: 4, title: "Commissioning & Handover", desc: "System testing, smartphone app setup, MCS certificate issuance, and SEG export setup." },
          { stepNum: 5, title: "25-Year Dedicated Aftercare", desc: "Enjoy ongoing performance monitoring and UK customer engineering support." },
        ],
      },
    },
    {
      id: "block-9-payment-schedule",
      type: "payment_schedule",
      title: "9. Payment Schedule",
      order: 9,
      enabled: true,
      data: {
        headline: "Transparent Payment Milestones",
        description: "Payment is structured into clear milestone stages. No hidden fees.",
      },
    },
    {
      id: "block-10-final-price",
      type: "final_price_summary",
      title: "10. Final Price Summary",
      order: 10,
      enabled: true,
      data: {
        headline: "Turnkey Investment Summary",
        notes: "All pricing includes full installation, scaffolding, MCS certification, and 0% UK VAT rate.",
      },
    },
    {
      id: "block-11-acceptance",
      type: "acceptance",
      title: "11. Acceptance & Next Steps",
      order: 11,
      enabled: true,
      data: {
        headline: "Ready to Accept Your Proposal?",
        termsNotice: "By accepting this proposal, you agree to reserve your installation slot. Our team will contact you to arrange your technical survey.",
      },
    },
  ];

  const defaultExtraProducts = [
    {
      id: "ext-hanchu-gateway",
      name: "Hanchu ESS Whole-House Backup Gateway",
      brand: "Hanchu ESS",
      description: "Automatic grid outage isolation. Keeps your essential home circuits running during power cuts.",
      price: 650,
      image: "https://images.unsplash.com/photo-1548611635-b6e7827d7d4a?auto=format&fit=crop&w=400&q=80",
      included: false,
      isOptional: true,
    },
    {
      id: "ext-tigo-optimisers",
      name: "Tigo TS4-A-O Solar Panel Optimisers (Set of 4)",
      brand: "Tigo Energy",
      description: "Selective panel-level MPPT optimization for shaded chimney or dormer roof areas.",
      price: 280,
      image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=400&q=80",
      included: false,
      isOptional: true,
    },
    {
      id: "ext-bird-mesh",
      name: "Stainless Steel Pest & Bird Protection Mesh",
      brand: "Madola Shield",
      description: "Perimeter protective mesh around solar array to prevent nesting birds and squirrels.",
      price: 250,
      image: "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=400&q=80",
      included: true,
      isOptional: true,
    },
    {
      id: "ext-warranty-10yr",
      name: "Extended 10-Year Workmanship & Workmanship Guarantee",
      brand: "Madola Care",
      description: "Complete 10-year comprehensive labor, roof integrity, and inverter maintenance warranty.",
      price: 350,
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80",
      included: false,
      isOptional: true,
    },
  ];

  const defaultEvCharger = {
    id: "ev-myenergi-zappi",
    name: "myenergi zappi 7kW Smart EV Charger",
    brand: "myenergi",
    description: "UK's #1 eco-smart EV charger. Uses 100% surplus solar power to charge your electric vehicle for free.",
    price: 950,
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80",
    included: false,
    selected: false,
    isOptional: true,
  };

  return {
    id: "template-madola-standard",
    reference: "2C1BFH47BMWY",
    customer: {
      id: "cust-template",
      name: "[Customer Name]",
      email: "[Customer Email]",
      address: "[Property Address]",
      postcode: "[Postcode]",
      phone: "[Phone Number]",
    },
    panelCount: 12,
    panelWattage: 450,
    systemSizeKw: "5.4",
    batteryCapacity: 9.4,
    inverterRating: 5.0,
    basePrice: 7950,
    extraProducts: defaultExtraProducts,
    evCharger: defaultEvCharger,
    paymentSchedule: [
      {
        id: "m-1",
        label: "1. Upfront Deposit",
        percentage: 25,
        paymentMethod: "Bank Transfer / Card",
        description: "Secures equipment procurement, DNO grid application & scaffolding scheduling.",
      },
      {
        id: "m-2",
        label: "2. Final Balance Upon Commissioning",
        percentage: 75,
        paymentMethod: "Bank Transfer",
        description: "Paid after 1-day installation, MCS testing, and mobile app handover.",
      },
    ],
    blocks,
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preparedBy: {
      name: "Madola Engineering Team",
      email: "proposals@madola.co.uk",
      phone: "+44 (0) 800 123 4567",
    },
  };
}
