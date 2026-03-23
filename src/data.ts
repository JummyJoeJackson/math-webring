export interface Member {
  name: string
  website: string
  /** Graduation year or expected graduation year */
  year: string
}

export const members: Member[] = [
  // Add members here — keep sorted by join order (append to bottom)
  // {
  //   name: "Your Name",
  //   website: "https://your-website.com",
  //   year: "20XX",
  // },
  {
    name: "Diego Gonzalez",
    website: "https://diegogonzalez.tech",
    year: "2030",
  },
  {
    name: "Ryan Li",
    website: "https://ryan-li.ca",
    year: "2030",
  },
  {
    name: "Joshua Jennings",
    website: "https://joshuajennings.ca",
    year: "2030",
  },
  {
    name: "Siddharth Tiwari",
    website: "https://siddharthtiwari.com",
    year: "2030",
  },
]
