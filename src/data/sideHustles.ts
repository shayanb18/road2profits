import { SideHustleResponse } from "../types";

export const SIDE_HUSTLES: SideHustleResponse[] = [
  {
    id: "sh-001",
    title: "Peer Tutoring",
    type: "tutoring",
    estimatedEarnings: "$20–50/hr",
    flexibility: "high",
    locationType: "hybrid",
    description:
      "Tutor fellow students in your strongest subjects. Post on campus boards or platforms like Wyzant and Tutor.com.",
    city: null,
    tags: ["academic", "flexible", "no-startup-cost", "campus"],
  },
  {
    id: "sh-002",
    title: "Freelance Graphic Design",
    type: "freelance",
    estimatedEarnings: "$25–75/hr",
    flexibility: "high",
    locationType: "remote",
    description:
      "Design logos, social media posts, or flyers for small businesses on Fiverr or Upwork.",
    city: null,
    tags: ["creative", "remote", "portfolio-builder"],
  },
  {
    id: "sh-003",
    title: "Grocery / Instacart Delivery",
    type: "gig",
    estimatedEarnings: "$15–22/hr",
    flexibility: "high",
    locationType: "local",
    description:
      "Deliver groceries in your own time. Great if you have a car or bike in a dense city.",
    city: null,
    tags: ["gig", "flexible", "no-experience", "physical"],
  },
  {
    id: "sh-004",
    title: "Content Writing / Copywriting",
    type: "freelance",
    estimatedEarnings: "$20–60/hr",
    flexibility: "high",
    locationType: "remote",
    description:
      "Write blog posts, product descriptions, or web copy for businesses. Great if you're in a writing-heavy program.",
    city: null,
    tags: ["writing", "remote", "flexible", "portfolio-builder"],
  },
  {
    id: "sh-005",
    title: "Campus Brand Ambassador",
    type: "part_time",
    estimatedEarnings: "$15–18/hr",
    flexibility: "medium",
    locationType: "local",
    description:
      "Represent brands on campus for events and promotions. Usually posted through your university's student jobs portal.",
    city: null,
    tags: ["campus", "social", "part-time", "events"],
  },
  {
    id: "sh-006",
    title: "Web Development (Freelance)",
    type: "freelance",
    estimatedEarnings: "$30–90/hr",
    flexibility: "high",
    locationType: "remote",
    description:
      "Build simple websites for local businesses using WordPress, Webflow, or custom code. High demand, high pay.",
    city: null,
    tags: ["tech", "remote", "portfolio-builder", "high-earning"],
  },
  {
    id: "sh-007",
    title: "Task Rabbit / Odd Jobs",
    type: "gig",
    estimatedEarnings: "$18–35/hr",
    flexibility: "high",
    locationType: "local",
    description:
      "Help people with moving, assembling furniture, cleaning, or other tasks through TaskRabbit.",
    city: null,
    tags: ["physical", "local", "flexible", "no-experience"],
  },
  {
    id: "sh-008",
    title: "Online Survey & UX Testing",
    type: "online",
    estimatedEarnings: "$10–20/hr",
    flexibility: "high",
    locationType: "remote",
    description:
      "Complete paid surveys or participate in UX research sessions on platforms like UserTesting or Prolific.",
    city: null,
    tags: ["passive", "remote", "beginner-friendly", "low-commitment"],
  },
  {
    id: "sh-009",
    title: "Social Media Management",
    type: "freelance",
    estimatedEarnings: "$15–40/hr",
    flexibility: "high",
    locationType: "remote",
    description:
      "Manage Instagram, TikTok, or LinkedIn accounts for small businesses or influencers.",
    city: null,
    tags: ["creative", "remote", "social-media", "portfolio-builder"],
  },
  {
    id: "sh-010",
    title: "Library / TA / Campus Job",
    type: "campus",
    estimatedEarnings: "$16–20/hr",
    flexibility: "medium",
    locationType: "local",
    description:
      "Apply for on-campus jobs through your school's student employment portal. Stable hours and student-friendly scheduling.",
    city: null,
    tags: ["campus", "stable", "academic", "resume-builder"],
  },
  {
    id: "sh-011",
    title: "Reselling (Thrift Flipping)",
    type: "online",
    estimatedEarnings: "$5–50/item",
    flexibility: "high",
    locationType: "hybrid",
    description:
      "Buy underpriced items at thrift stores and resell them on Facebook Marketplace, Poshmark, or Depop for profit.",
    city: null,
    tags: ["entrepreneurial", "flexible", "low-startup", "online"],
  },
  {
    id: "sh-012",
    title: "Dog Walking / Pet Sitting",
    type: "gig",
    estimatedEarnings: "$15–25/hr",
    flexibility: "high",
    locationType: "local",
    description:
      "Walk dogs or pet-sit through Rover or Wag. Great if you're an animal lover who wants outdoor time.",
    city: null,
    tags: ["physical", "outdoor", "local", "flexible"],
  },
];

export function filterSideHustles(params: {
  city?: string;
  mode?: string;
  tags?: string[];
  limit?: number;
}): SideHustleResponse[] {
  let results = [...SIDE_HUSTLES];

  if (params.mode === "remote") {
    results = results.filter((h) => h.locationType === "remote");
  } else if (params.mode === "local") {
    results = results.filter((h) =>
      ["local", "hybrid"].includes(h.locationType)
    );
  }

  if (params.tags && params.tags.length > 0) {
    results = results.filter((h) =>
      params.tags!.some((tag) => h.tags.includes(tag))
    );
  }

  return results.slice(0, params.limit ?? 6);
}
