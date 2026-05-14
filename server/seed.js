import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Product from "./models/Product.js";
import ProductStat from "./models/ProductStat.js";
import Transaction from "./models/Transaction.js";
import OverallStat from "./models/OverallStat.js";
import AffiliateStat from "./models/AffiliateStat.js";

dotenv.config();

// ─── USERS ────────────────────────────────────────────────────────────────────
// The frontend hardcodes userId "63701cc1f03239b7f700000e" for the logged-in user
const dataUser = [
  {
    _id: new mongoose.Types.ObjectId("63701cc1f03239b7f700000e"),
    name: "Manas Gupta",
    email: "manas@risklens.ai",
    password: "$2b$10$dummyhashedpassword123456789012345678901234",
    city: "Mumbai",
    state: "Maharashtra",
    country: "IN",
    occupation: "Chief Risk Officer",
    phoneNumber: "+91-9876543210",
    transactions: [],
    role: "superadmin",
  },
  {
    _id: new mongoose.Types.ObjectId("63701cc1f03239b7f7000010"),
    name: "Priya Sharma",
    email: "priya.sharma@risklens.ai",
    password: "$2b$10$dummyhashedpassword123456789012345678901234",
    city: "Delhi",
    state: "Delhi",
    country: "IN",
    occupation: "Risk Analyst",
    phoneNumber: "+91-9876543211",
    transactions: [],
    role: "admin",
  },
  {
    _id: new mongoose.Types.ObjectId("63701cc1f03239b7f7000011"),
    name: "James Carter",
    email: "james.carter@enterprise.com",
    password: "$2b$10$dummyhashedpassword123456789012345678901234",
    city: "New York",
    state: "NY",
    country: "US",
    occupation: "Portfolio Manager",
    phoneNumber: "+1-212-555-0101",
    transactions: [],
    role: "user",
  },
  {
    _id: new mongoose.Types.ObjectId("63701cc1f03239b7f7000012"),
    name: "Sophia Zhang",
    email: "sophia.zhang@globalfin.com",
    password: "$2b$10$dummyhashedpassword123456789012345678901234",
    city: "Shanghai",
    state: "Shanghai",
    country: "CN",
    occupation: "Compliance Officer",
    phoneNumber: "+86-21-5555-0102",
    transactions: [],
    role: "user",
  },
  {
    _id: new mongoose.Types.ObjectId("63701cc1f03239b7f7000013"),
    name: "Lukas Müller",
    email: "lukas.muller@eurorisk.de",
    password: "$2b$10$dummyhashedpassword123456789012345678901234",
    city: "Frankfurt",
    state: "Hessen",
    country: "DE",
    occupation: "Quantitative Analyst",
    phoneNumber: "+49-69-5555-0103",
    transactions: [],
    role: "user",
  },
  {
    _id: new mongoose.Types.ObjectId("63701cc1f03239b7f7000014"),
    name: "Amara Okafor",
    email: "amara.okafor@africarisk.ng",
    password: "$2b$10$dummyhashedpassword123456789012345678901234",
    city: "Lagos",
    state: "Lagos",
    country: "NG",
    occupation: "Market Risk Manager",
    phoneNumber: "+234-1-555-0104",
    transactions: [],
    role: "user",
  },
  {
    _id: new mongoose.Types.ObjectId("63701cc1f03239b7f7000015"),
    name: "Emma Watson",
    email: "emma.watson@londonhedge.co.uk",
    password: "$2b$10$dummyhashedpassword123456789012345678901234",
    city: "London",
    state: "England",
    country: "GB",
    occupation: "Senior Trader",
    phoneNumber: "+44-20-5555-0105",
    transactions: [],
    role: "user",
  },
  {
    _id: new mongoose.Types.ObjectId("63701cc1f03239b7f7000016"),
    name: "Carlos Mendes",
    email: "carlos.mendes@latamfin.br",
    password: "$2b$10$dummyhashedpassword123456789012345678901234",
    city: "São Paulo",
    state: "SP",
    country: "BR",
    occupation: "Credit Risk Analyst",
    phoneNumber: "+55-11-5555-0106",
    transactions: [],
    role: "user",
  },
  {
    _id: new mongoose.Types.ObjectId("63701cc1f03239b7f7000017"),
    name: "Yuki Tanaka",
    email: "yuki.tanaka@tokyocap.jp",
    password: "$2b$10$dummyhashedpassword123456789012345678901234",
    city: "Tokyo",
    state: "Tokyo",
    country: "JP",
    occupation: "Derivatives Strategist",
    phoneNumber: "+81-3-5555-0107",
    transactions: [],
    role: "admin",
  },
  {
    _id: new mongoose.Types.ObjectId("63701cc1f03239b7f7000018"),
    name: "Aisha Khan",
    email: "aisha.khan@gulfwealth.ae",
    password: "$2b$10$dummyhashedpassword123456789012345678901234",
    city: "Dubai",
    state: "Dubai",
    country: "AE",
    occupation: "Investment Advisor",
    phoneNumber: "+971-4-555-0108",
    transactions: [],
    role: "user",
  },
  {
    _id: new mongoose.Types.ObjectId("63701cc1f03239b7f7000019"),
    name: "Olivier Dupont",
    email: "olivier.dupont@parisfund.fr",
    password: "$2b$10$dummyhashedpassword123456789012345678901234",
    city: "Paris",
    state: "Île-de-France",
    country: "FR",
    occupation: "Fund Manager",
    phoneNumber: "+33-1-5555-0109",
    transactions: [],
    role: "admin",
  },
  {
    _id: new mongoose.Types.ObjectId("63701cc1f03239b7f700001a"),
    name: "Rahul Patel",
    email: "rahul.patel@finserv.in",
    password: "$2b$10$dummyhashedpassword123456789012345678901234",
    city: "Bangalore",
    state: "Karnataka",
    country: "IN",
    occupation: "Data Engineer",
    phoneNumber: "+91-80-5555-0110",
    transactions: [],
    role: "user",
  },
];

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
const productIds = Array.from({ length: 12 }, (_, i) =>
  new mongoose.Types.ObjectId(`63701cc1f03239c7f700010${i.toString(16)}`)
);

const dataProduct = [
  { _id: productIds[0], name: "RiskLens Core Platform", price: 24999, description: "Enterprise-grade real-time risk monitoring and analytics platform with ML-powered anomaly detection.", category: "Platform", rating: 4.8, supply: 150 },
  { _id: productIds[1], name: "Geo-Risk Mapping Module", price: 8499, description: "Geographic risk visualization with heat maps, exposure clustering, and country-level drill-downs.", category: "Analytics", rating: 4.6, supply: 300 },
  { _id: productIds[2], name: "Compliance Sentinel", price: 12999, description: "Automated regulatory compliance tracking across 40+ jurisdictions with real-time alert triggers.", category: "Compliance", rating: 4.7, supply: 200 },
  { _id: productIds[3], name: "Portfolio Stress Tester", price: 15999, description: "Monte Carlo simulation engine for portfolio stress testing under 200+ macro scenarios.", category: "Analytics", rating: 4.5, supply: 180 },
  { _id: productIds[4], name: "Credit Scoring API", price: 4999, description: "REST API for real-time credit scoring using ensemble ML models trained on 50M+ data points.", category: "API", rating: 4.4, supply: 500 },
  { _id: productIds[5], name: "KYC/AML Screening Suite", price: 18999, description: "Automated Know-Your-Customer and Anti-Money-Laundering screening with global sanctions list integration.", category: "Compliance", rating: 4.9, supply: 120 },
  { _id: productIds[6], name: "Real-Time Market Feed", price: 6999, description: "Sub-millisecond market data feed aggregating 15+ global exchanges with normalized output.", category: "Data", rating: 4.3, supply: 400 },
  { _id: productIds[7], name: "Executive Dashboard Pro", price: 3499, description: "C-suite level dashboard with KPI tracking, trend analysis, and automated board-ready PDF reports.", category: "Platform", rating: 4.7, supply: 350 },
  { _id: productIds[8], name: "Fraud Detection Engine", price: 22999, description: "Graph neural network-based fraud detection with real-time transaction scoring and case management.", category: "Security", rating: 4.8, supply: 100 },
  { _id: productIds[9], name: "Risk Data Warehouse", price: 34999, description: "Petabyte-scale risk data warehouse with columnar storage, OLAP cubes, and SQL/Python interfaces.", category: "Data", rating: 4.6, supply: 80 },
  { _id: productIds[10], name: "Operational Risk Tracker", price: 9999, description: "Track and quantify operational risk events with loss distribution modeling and key risk indicators.", category: "Analytics", rating: 4.4, supply: 250 },
  { _id: productIds[11], name: "Client Onboarding Workflow", price: 7499, description: "Digitized client onboarding with document OCR, identity verification, and risk profiling.", category: "Platform", rating: 4.5, supply: 280 },
];

// ─── PRODUCT STATS ────────────────────────────────────────────────────────────
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function generateMonthlyData(baseMonthly) {
  return months.map((month, i) => ({
    month,
    totalSales: Math.round(baseMonthly * (0.7 + Math.random() * 0.6) * (1 + i * 0.02)),
    totalUnits: Math.round((baseMonthly / 100) * (0.7 + Math.random() * 0.6)),
  }));
}

function generateDailyData(year) {
  const data = [];
  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      data.push({
        date: dateStr,
        totalSales: Math.round(800 + Math.random() * 4200),
        totalUnits: Math.round(5 + Math.random() * 45),
      });
    }
  }
  return data;
}

const dataProductStat = productIds.map((pid, i) => {
  const basePrice = dataProduct[i].price;
  const monthlyBase = basePrice * (3 + Math.random() * 5);
  const monthlyData = generateMonthlyData(monthlyBase);
  const yearlySalesTotal = monthlyData.reduce((s, m) => s + m.totalSales, 0);
  const yearlyTotalSoldUnits = monthlyData.reduce((s, m) => s + m.totalUnits, 0);
  return {
    productId: pid.toString(),
    yearlySalesTotal,
    yearlyTotalSoldUnits,
    year: 2021,
    monthlyData,
    dailyData: generateDailyData(2021),
  };
});

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
const transactionIds = Array.from({ length: 50 }, (_, i) =>
  new mongoose.Types.ObjectId()
);

const dataTransaction = transactionIds.map((tid, i) => {
  const userIdx = i % dataUser.length;
  const numProducts = 1 + Math.floor(Math.random() * 3);
  const products = Array.from({ length: numProducts }, () =>
    productIds[Math.floor(Math.random() * productIds.length)]
  );
  const cost = (500 + Math.random() * 49500).toFixed(2);

  // Link transaction back to user
  if (!dataUser[userIdx].transactions.includes(tid.toString())) {
    dataUser[userIdx].transactions.push(tid.toString());
  }

  return {
    _id: tid,
    userId: dataUser[userIdx]._id.toString(),
    cost: cost,
    products,
  };
});

// ─── OVERALL STAT ─────────────────────────────────────────────────────────────
const overallMonthlyData = months.map((month) => ({
  month,
  totalSales: Math.round(120000 + Math.random() * 80000),
  totalUnits: Math.round(800 + Math.random() * 600),
}));

const overallDailyData = generateDailyData(2021);

const dataOverallStat = [
  {
    totalCustomers: dataUser.filter((u) => u.role === "user").length,
    yearlySalesTotal: overallMonthlyData.reduce((s, m) => s + m.totalSales, 0),
    yearlyTotalSoldUnits: overallMonthlyData.reduce((s, m) => s + m.totalUnits, 0),
    year: 2021,
    monthlyData: overallMonthlyData,
    dailyData: overallDailyData,
    salesByCategory: {
      Platform: 385420,
      Analytics: 264890,
      Compliance: 198750,
      API: 142300,
      Data: 178600,
      Security: 215040,
    },
  },
];

// ─── AFFILIATE STATS ──────────────────────────────────────────────────────────
// Create affiliate stats for admin/superadmin users
const adminUsers = dataUser.filter((u) => u.role === "admin" || u.role === "superadmin");
const dataAffiliateStat = adminUsers.map((user) => {
  const numSales = 3 + Math.floor(Math.random() * 8);
  const affiliateSales = Array.from({ length: numSales }, () =>
    transactionIds[Math.floor(Math.random() * transactionIds.length)]
  );
  return {
    userId: user._id,
    affiliateSales,
  };
});

// ─── SEED FUNCTION ────────────────────────────────────────────────────────────
async function seed() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB\n");

    // Clear existing data
    console.log("🗑️  Clearing existing collections...");
    await User.deleteMany({});
    await Product.deleteMany({});
    await ProductStat.deleteMany({});
    await Transaction.deleteMany({});
    await OverallStat.deleteMany({});
    await AffiliateStat.deleteMany({});
    console.log("✅ Collections cleared\n");

    // Insert data
    console.log("📦 Inserting Users...");
    await User.insertMany(dataUser);
    console.log(`   → ${dataUser.length} users inserted`);

    console.log("📦 Inserting Products...");
    await Product.insertMany(dataProduct);
    console.log(`   → ${dataProduct.length} products inserted`);

    console.log("📦 Inserting Product Stats...");
    await ProductStat.insertMany(dataProductStat);
    console.log(`   → ${dataProductStat.length} product stats inserted`);

    console.log("📦 Inserting Transactions...");
    await Transaction.insertMany(dataTransaction);
    console.log(`   → ${dataTransaction.length} transactions inserted`);

    console.log("📦 Inserting Overall Stats...");
    await OverallStat.insertMany(dataOverallStat);
    console.log(`   → ${dataOverallStat.length} overall stat(s) inserted`);

    console.log("📦 Inserting Affiliate Stats...");
    await AffiliateStat.insertMany(dataAffiliateStat);
    console.log(`   → ${dataAffiliateStat.length} affiliate stats inserted`);

    console.log("\n🎉 Seed complete! All data inserted successfully.");
    console.log(`\n📊 Summary:`);
    console.log(`   Users:          ${dataUser.length}`);
    console.log(`   Products:       ${dataProduct.length}`);
    console.log(`   Product Stats:  ${dataProductStat.length}`);
    console.log(`   Transactions:   ${dataTransaction.length}`);
    console.log(`   Overall Stats:  ${dataOverallStat.length}`);
    console.log(`   Affiliate Stats: ${dataAffiliateStat.length}`);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB.");
    process.exit(0);
  }
}

seed();
