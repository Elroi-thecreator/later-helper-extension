import { PageCategory } from '../models/SavedPage';

interface CategoryRule {
  category: PageCategory;
  domains: string[];
  patterns: RegExp[];
  titleKeywords: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'Shopping',
    domains: [
      'amazon.', 'flipkart.com', 'myntra.com', 'ebay.com', 'etsy.com',
      'walmart.com', 'target.com', 'bestbuy.com', 'aliexpress.com',
      'meesho.com', 'nykaa.com', 'ajio.com', 'shopify.com'
    ],
    patterns: [/\/product\//i, /\/item\//i, /\/dp\//i, /\/p\//i, /\/buy\//i, /\/cart/i],
    titleKeywords: ['buy', 'price in', 'order online', 'free shipping', 'discount', 'deal', 'sale']
  },
  {
    category: 'Video',
    domains: [
      'youtube.com', 'youtu.be', 'vimeo.com', 'twitch.tv', 'netflix.com',
      'dailymotion.com', 'tiktok.com', 'hulu.com', 'disneyplus.com', 'primevideo.com'
    ],
    patterns: [/\/watch/i, /\/video\//i, /\/videos\//i, /\/clip\//i, /\/shorts\//i],
    titleKeywords: ['watch', 'trailer', 'episode', 'season', 'livestream']
  },
  {
    category: 'Jobs',
    domains: [
      'linkedin.com/jobs', 'indeed.com', 'naukri.com', 'glassdoor.com',
      'wellfound.com', 'monster.com', 'lever.co', 'greenhouse.io', 'workday.com'
    ],
    patterns: [/\/jobs\//i, /\/job\//i, /\/careers\//i, /\/openings\//i, /\/vacancy\//i],
    titleKeywords: ['hiring', 'job opening', 'job description', 'apply now', 'careers at']
  },
  {
    category: 'Learning',
    domains: [
      'udemy.com', 'coursera.org', 'edx.org', 'khanacademy.org',
      'pluralsight.com', 'datacamp.com', 'freecodecamp.org', 'codecademy.com',
      'geeksforgeeks.org', 'w3schools.com', 'stackoverflow.com', 'developer.mozilla.org'
    ],
    patterns: [/\/course\//i, /\/learn\//i, /\/tutorial\//i, /\/doc(s)?\//i, /\/guide\//i],
    titleKeywords: ['tutorial', 'course', 'learn', 'handbook', 'cheat sheet', 'documentation', 'syllabus']
  },
  {
    category: 'Travel',
    domains: [
      'booking.com', 'airbnb.com', 'tripadvisor.com', 'expedia.com',
      'makemytrip.com', 'agoda.com', 'kayak.com', 'hostelworld.com', 'irctc.co.in'
    ],
    patterns: [/\/hotel(s)?\//i, /\/flights\//i, /\/rooms\//i, /\/stay\//i, /\/itinerary\//i],
    titleKeywords: ['hotel', 'flight', 'resort', 'homestay', 'vacation rental', 'travel guide', 'booking']
  },
  {
    category: 'Food',
    domains: [
      'allrecipes.com', 'foodnetwork.com', 'seriouseats.com', 'swiggy.com',
      'zomato.com', 'bonappetit.com', 'epicurious.com', 'yummly.com'
    ],
    patterns: [/\/recipe(s)?\//i, /\/restaurant(s)?\//i, /\/menu\//i, /\/dish\//i],
    titleKeywords: ['recipe', 'ingredients', 'cook time', 'prep time', 'cuisine', 'nutrition facts']
  },
  {
    category: 'News',
    domains: [
      'reuters.com', 'apnews.com', 'bloomberg.com', 'bbc.com', 'cnn.com',
      'thehindu.com', 'nytimes.com', 'theguardian.com', 'wsj.com', 'techcrunch.com'
    ],
    patterns: [/\/news\//i, /\/article\//i, /\/\d{4}\/\d{2}\/\d{2}\//],
    titleKeywords: ['breaking news', 'investigation', 'reported', 'opinion:', 'editorial']
  },
  {
    category: 'Social',
    domains: [
      'twitter.com', 'x.com', 'reddit.com', 'facebook.com', 'instagram.com',
      'threads.net', 'mastodon.social', 'bsky.app', 'linkedin.com/feed'
    ],
    patterns: [/\/status\//i, /\/comments\//i, /\/post\//i, /\/reel\//i],
    titleKeywords: ['reddit', 'tweets', 'timeline', 'post by']
  },
  {
    category: 'Technology',
    domains: [
      'github.com', 'gitlab.com', 'news.ycombinator.com', 'theverge.com',
      'wired.com', 'arstechnica.com', 'dev.to', 'hashnode.dev', 'medium.com'
    ],
    patterns: [/\/commit\//i, /\/pull\//i, /\/blob\//i, /\/tree\//i, /\/tag\//i],
    titleKeywords: ['release notes', 'sdk', 'api reference', 'framework', 'vulnerability', 'benchmark']
  }
];

export class CategoryService {
  public static detect(url: string, title: string = '', metaDescription: string = ''): PageCategory {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');
      const pathAndQuery = `${parsedUrl.pathname}${parsedUrl.search}`.toLowerCase();
      const combinedText = `${title} ${metaDescription}`.toLowerCase();

      for (const rule of CATEGORY_RULES) {
        if (rule.domains.some((d) => hostname.includes(d) || `${hostname}${pathAndQuery}`.includes(d))) {
          return rule.category;
        }
      }

      for (const rule of CATEGORY_RULES) {
        if (rule.patterns.some((pattern) => pattern.test(pathAndQuery))) {
          return rule.category;
        }
      }

      for (const rule of CATEGORY_RULES) {
        if (rule.titleKeywords.some((keyword) => combinedText.includes(keyword))) {
          return rule.category;
        }
      }

      return 'Other';
    } catch {
      return 'Other';
    }
  }

  public static getAllCategories(): PageCategory[] {
    return [
      'Shopping',
      'Food',
      'Travel',
      'Learning',
      'Video',
      'Jobs',
      'News',
      'Technology',
      'Social',
      'Other'
    ];
  }
}