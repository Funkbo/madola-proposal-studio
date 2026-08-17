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
      title: "What's Included",
      order: 5,
      enabled: true,
      data: {
        pillBadge: "What's Included",
        items: [
          {
            id: "inc-bird",
            title: "Bird Protection",
            image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80",
            description:
              "As standard, we protect your solar investment and your roof by adding Bird Protection to your solar system, at no extra cost. Nesting birds can cause serious damage to panels, wiring, and roofing over time leading to costly repairs and reduced system efficiency. Our discreet and durable bird-proofing solutions keep pests away and keep your installation working at peak performance.",
            details:
              "High-grade stainless steel & UV-stabilized polycarbonate mesh installed around the full array perimeter.",
          },
          {
            id: "inc-scaffold",
            title: "Scaffolding",
            image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
            description:
              "Scaffolding is often required for a solar installation to provide safe and stable access to the roof for installers working at height. It helps protect both the workers and the property by reducing the risk of falls, allowing equipment and panels to be moved securely, and ensuring the installation can be completed efficiently and in full compliance with HSE safety regulations.",
            details:
              "Erected by TG20:21 compliant certified scaffolders, fully inspected with handrails and toe-boards.",
          },
          {
            id: "inc-cert",
            title: "All Necessary Certification",
            image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
            description:
              "All necessary MCS certification, Consumer Code documentation, and DNO notification or approval paperwork are included as part of a solar installation. This ensures the system is installed to recognised industry standards, fully compliant with current regulations, and supported with the correct documentation required for insurance, building control, and Smart Export Guarantee (SEG) export payments.",
            details:
              "Complete handover pack including MCS Certificate, G98/G99 DNO Approval, NAPIT Electrical Compliance, and HIES Warranty.",
          },
        ],
      },
    },
    {
      id: "block-6-ev-charger",
      type: "ev_charger",
      title: "Add an EV?",
      order: 6,
      enabled: true,
      data: {
        pillBadge: "Add an EV?",
        heading: "Add an EV Charger?",
      },
    },
    {
      id: "block-7-extra-products",
      type: "extra_products",
      title: "Extra products",
      order: 7,
      enabled: true,
      data: {
        pillBadge: "Extra products",
        heading: "Extra products",
      },
    },
    {
      id: "block-8-next-steps",
      type: "next_steps",
      title: "Text",
      order: 8,
      enabled: true,
      data: {
        pillBadge: "Text",
        heading: "Next Steps",
        steps: [
          {
            stepNum: 1,
            title: "Survey and design",
            desc: "Our surveyor checks your roof structure, electrics and access, and we finalise your design and your price. You're assigned a project coordinator who stays with you from here to handover — one name and one number throughout. Nothing to pay at this stage.",
          },
          {
            stepNum: 2,
            title: "Deposit and scheduling",
            desc: "With the design agreed we take 25%, protected under our HIES insurance-backed guarantee. We apply to your network operator for grid approval and book your scaffold and install dates. Grid approval is what sets your timeline, so we start it the day the design is signed off.",
          },
          {
            stepNum: 3,
            title: "Installation",
            desc: "Scaffold goes up, the system goes in, and we test and commission it. Most homes are done in one to two days. Your power is off for under two hours while we connect to the consumer unit, agreed with you in advance.",
          },
          {
            stepNum: 4,
            title: "Completion",
            desc: "The remaining 75% falls due once the system is live. We issue your MCS certificate, register the electrical work with building control under our NAPIT registration, set up your monitoring app and hand over your documentation pack.",
          },
          {
            stepNum: 5,
            title: "Aftercare",
            desc: "Two jobs are yours: tell your home insurer the panels are on, as they now form part of the building, and apply to your energy supplier for a Smart Export Guarantee tariff. We'll point you at the best rates. Everything else is ours — MCS registration, network operator sign-off, building control, manufacturer warranty registration and scaffold removal. Your coordinator stays with you through your first bill.",
          },
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
