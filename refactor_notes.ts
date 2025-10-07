/**
 * ================================================================
 * Refactor / Coding Test Reference Notes
 * (Personal Study – not AI, just your own notes)
 * ================================================================
 *
 * 📝 Step-by-step pattern:
 *
 * 1) Write assumptions at the top of your file
 * 2) Run `npm install`, `npm test`, `tsc` to check repo health
 * 3) Plan with comments before coding
 * 4) Define interfaces/types first
 * 5) Implement logic in single loop / small clean functions
 * 6) Test edge cases (empty input, missing fields, big numbers)
 * 7) Format, comment, and commit
 *
 * ✅ Quick checklist:
 * [ ] Assumptions block written
 * [ ] Repo builds / tests run
 * [ ] Types/interfaces declared
 * [ ] Single-pass logic implemented
 * [ ] Edge cases tested
 * [ ] Code formatted & commented
 * [ ] Commit + push with clear message
 *
 * ================================================================
 * Example interfaces (adjust to task)
 * ================================================================
 */

interface Order {
  price: number;
}

interface User {
  id: number;
  active: boolean;
  role: "user" | "premium";
  email?: string;
  orders: Order[];
}

interface Report {
  active: number;
  inactive: number;
  revenue: number;
  premiumEmails: string[];
  topSpenders: User[];
}

/**
 * ================================================================
 * Example skeleton function (fill in as needed during test)
 * ================================================================
 */

function processData(users: User[]): Report {
  let active = 0;
  let inactive = 0;
  let revenue = 0;
  const premiumEmails: string[] = [];
  const topSpenders: User[] = [];

  for (const u of users) {
    // Count active/inactive
    u.active ? active++ : inactive++;

    // Sum revenue
    const userTotal = u.orders.reduce((sum, o) => sum + o.price, 0);
    revenue += userTotal;

    // Collect premium emails
    if (u.role === "premium" && u.email) {
      premiumEmails.push(u.email);
    }

    // Identify top spenders
    if (userTotal > 1000) {
      topSpenders.push(u);
    }
  }

  return {
    active,
    inactive,
    revenue,
    premiumEmails,
    topSpenders,
  };
}

/**
 * ================================================================
 * Usage Example
 * ================================================================
 */
const users: User[] = [
  {
    id: 1,
    active: true,
    role: "premium",
    email: "a@example.com",
    orders: [{ price: 500 }, { price: 600 }],
  },
  {
    id: 2,
    active: false,
    role: "user",
    orders: [],
  },
];

console.log(processData(users));

/**
 * ================================================================
 * End of Reference Notes
 * ================================================================
 */
