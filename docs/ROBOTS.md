# robots.txt and indexing for the lab

What `robots.txt` and the exhibit's meta tags do, and the vendor documentation each user-agent name comes from. Pages were fetched on 2026-10-16.

## The rules

1. **The exhibit is kept out of search by `noindex`, not by `robots.txt`.** `/exhibits/humanity/` carries `<meta name="robots" content="noindex,nofollow">` and is left out of `sitemap.xml`. Search crawlers must be allowed to fetch it, or they would never see the tag. Google: "For the noindex rule to be effective, the page or resource must not be blocked by a robots.txt file… If the page is blocked by a robots.txt file or the crawler can't access the page, the crawler will never see the noindex rule, and the page can still appear in search results." ([Google, Block Search indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing))
2. **Why noindex matters here.** Google's spam policies give "Using white text on a white background" and "Using CSS to position text off-screen" as examples of hidden text abuse. The exhibit does exactly that on purpose, so it must not be an indexed page. ([Google, Spam policies: hidden text and link abuse](https://developers.google.com/search/docs/essentials/spam-policies))
3. **Never block the agents being tested.** User-triggered fetchers are what an assistant uses when a person pastes a link. Blocking them would void the test, and several vendors say these fetchers may not follow `robots.txt` anyway. None is named in `robots.txt`, so the `User-agent: *` / `Allow: /` group applies to them.
4. **Never block Googlebot or Bingbot.** They stay under `User-agent: *`.
5. **Optional, done: ask AI-training crawlers to skip the exhibit only.** `GPTBot`, `ClaudeBot` and `CCBot` get `Disallow: /exhibits/humanity/`; the rest of the lab stays open to them.
6. **Deliberately not disallowed:** `Google-Extended`. Google documents that token as controlling Gemini training *and* grounding in Gemini Apps, so disallowing it could stop Gemini from reading the page when a tester asks it to, which would void the test.

## User-agent names and sources

| Token | Operator and purpose | In `robots.txt` | Source |
|---|---|---|---|
| `ChatGPT-User` | OpenAI, fetches a page when a ChatGPT user asks. "Because these actions are initiated by a user, robots.txt rules may not apply." | not named (allowed) | [OpenAI, Overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots) |
| `OAI-SearchBot` | OpenAI, search results in ChatGPT | not named (allowed) | same |
| `GPTBot` | OpenAI, crawls content that may be used to train foundation models | disallowed on the exhibit | same |
| `Claude-User` | Anthropic, "When individuals ask questions to Claude, it may access websites using a Claude-User agent." | not named (allowed) | [Anthropic, Does Anthropic crawl data from the web](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) |
| `Claude-SearchBot` | Anthropic, search quality | not named (allowed) | same |
| `ClaudeBot` | Anthropic, collects content that could contribute to model training | disallowed on the exhibit | same |
| `Perplexity-User` | Perplexity, user actions; "Since a user requested the fetch, this fetcher generally ignores robots.txt rules." | not named (allowed) | [Perplexity crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers) |
| `PerplexityBot` | Perplexity, search results; "not used to crawl content for AI foundation models" | not named (allowed) | same |
| `Google-Agent`, `Google-GeminiNotebook` and other user-triggered fetchers | Google; "Because the fetch was requested by a user, these fetchers generally ignore robots.txt rules." | not named (allowed) | [Google user-triggered fetchers](https://developers.google.com/crawling/docs/crawlers-fetchers/google-user-triggered-fetchers) |
| `Googlebot` | Google Search | allowed | [Google common crawlers](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers) |
| `Google-Extended` | Google, controls use for Gemini training and grounding; no separate HTTP user agent | not named (allowed, see rule 6) | same |
| `bingbot` | Microsoft Bing search | allowed | [Bing Webmaster Tools help: which crawlers does Bing use](https://www.bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0) |
| `CCBot` | Common Crawl, which publishes an open web crawl that is often used to train models | disallowed on the exhibit | [Common Crawl, CCBot](https://commoncrawl.org/ccbot) |

Robots rules are requests, not access control. They keep honest training crawlers away from the trap text; they do not, and should not, stop a person's assistant from reading the page.
