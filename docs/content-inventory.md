# Content inventory

Exhaustive lists of the links, assets, and copy that a tester needs in order to verify content without
opening the live site. All data transcribed from the current source files.

---

## 1. Homepage links

Only elements that render today are listed; HTML-commented markup (promo banner, Gala nav item,
Resources nav item, Get Involved section) is excluded.

### 1.1 Navigation

| Label | Target | New tab | Tracking |
|---|---|---|---|
| *(logo)* | `#page-top` | no | — |
| What We Do | `#what-we-do` | no | — |
| Where We Work | `#projects` | no | — |
| Coffee | `#coffee` | no | — |
| Contact Us | `#contact` | no | — |
| DONATE | `#` (dropdown toggle) | no | — |
| ONLINE DONATION | *(no href — Aplos widget `24E7EE7BBE9CF54658F113B3D811E098`)* | n/a | `donation` / Online Donation (Nav) |
| CRYPTO DONATION | `https://platform.engiven.com/give/776/widget/554` | yes | `donation` / Crypto Donation (Nav) |

### 1.2 Body links

| Section | Label | Target | New tab | Tracking |
|---|---|---|---|---|
| Masthead | Tell Me More | `#what-we-do` | no | — |
| What We Do | *(flyer image)* | `newsletters/The Farms Process 2026.pdf` | yes | `pdf` / FARMS Approach Flyer |
| Newsletters | FARMS Approach | `newsletters/The Farms Process 2026.pdf` | yes | `pdf` / FARMS Approach |
| Newsletters | Recent Newsletters | `https://us3.campaign-archive.com/home/?u=327bff531daf5aae34d2fe667&id=8269e92cdf` | yes | `outbound` / Recent Newsletters Archive |
| Newsletters | FAQs | `newsletters/FARMS FAQs.pdf` | yes | `pdf` / FARMS FAQs |
| Newsletters | Giving Impact | `newsletters/FARMS Giving Impact 2026.pdf` | yes | `pdf` / FARMS Giving Impact |
| Newsletters | Other Ways to Give | `newsletters/FARMS Other Ways to Give 2026.pdf` | yes | `pdf` / FARMS Other Ways to Give |
| Newsletters | Recurring Giving | `newsletters/FARMS Recurring Giving 2026.pdf` | yes | `pdf` / FARMS Recurring Giving |
| Giving | ONLINE DONATION | *(button, Aplos widget)* | n/a | `donation` / Online Donation |
| Giving | CRYPTO DONATION | `https://platform.engiven.com/give/776/widget/554` | yes | `donation` / Crypto Donation |
| Giving | ECFA seal | `https://www.ecfa.org/MemberProfile.aspx?ID=7200` | yes | — |
| Giving | GuideStar seal | `https://www.guidestar.org/profile/22-1776920` | yes | — |
| Coffee | Get Brewing | `https://coffeehelpingfarms.com/` | **no** | `outbound` / FARMS Coffee |
| Coffee bar | Request Info | `mailto:info@farmsinternational.com?subject=FARMS Coffee Bar Info Request&body=…` | n/a | — |
| Contact | info@farmsinternational.com (in failure message) | `mailto:info@farmsinternational.com` | n/a | — |
| Contact | (218) 416-1961 | `tel:218-416-1961` | n/a | — |
| Subscribe | Email / Snail Mail | `#pills-email` / `#pills-snailmail` (pill tabs) | no | — |
| Subscribe | info@farmsinternational.com (in failure message) | `mailto:info@farmsinternational.com` | n/a | — |
| Footer | Twitter/X | `https://twitter.com/FARMSDoingGood` | yes | — |
| Footer | Facebook | `https://www.facebook.com/farmsinternational` | yes | — |
| Footer | Instagram | `https://www.instagram.com/farmsinternational` | yes | — |
| Footer | ECFA seal | `https://www.ecfa.org/MemberProfile.aspx?ID=7200` | yes | — |
| Footer | GuideStar seal | `https://www.guidestar.org/profile/22-1776920` | yes | — |

### 1.3 Links inside the hidden project modals

Present in the DOM but unreachable by any user interaction (see
[functional spec §2.13](functional-spec.md#213-hidden-project-modals)):
`./resources.html#bangladesh`, `./resources.html#haiti`, `./resources.html#moldova`,
`./resources.html#nagaland`, `./resources.html#philippines`, `./resources.html#thailand`, plus
`https://blog.farmsinternational.com/search/label/{Haiti,Moldova,Philippines,Thailand}`.

### 1.4 Embedded media

| Provider | URL | Wrapper label |
|---|---|---|
| YouTube | `https://www.youtube.com/embed/b1RceO4udjs` | `FARMS Coffee Video` |
| Vimeo | `https://player.vimeo.com/video/177505072` | `Cafe Diego Documentary` |

---

## 2. Resources page inventory

75 resource links across 8 columns: 53 newsletter PDF links, 20 Mission Network News articles, and
2 Vimeo videos. (Some PDFs are linked from more than one country, so the number of distinct files is
lower.)

### Cuba (`#cuba`)
Newsletters: November 2018 → `Nov2018FARMSNewsletterCuba.pdf` · April 2017 → `Cuba_April_2017email.pdf` ·
March 2015 → `Cuba_web_edition_2015.pdf` · March 2013 → `march2013FARMS_newsletter_email.pdf` ·
April 2012 → `Cuba_Newsletter_Web_Normal.pdf`

MNN: Cuba: the door opens wider (Feb 2015) · New US-Cuba relations helps, hurts (Dec 2014) ·
Cuba reforms prompt outreach (Jan 2014) · Cuba's economic reforms gain momentum (Oct 2012) ·
Cuba's reforms bring hope amid austerity (April 2012)

### Bangladesh (`#bangladesh`)
Newsletters: June 2019 → `June 2019 E-Newsletter.pdf` · February 2014 → `FEB_2014_newsletter_web_edition.pdf` ·
May 2013 → `May_2013_Bengali_newsletteremail.pdf` · September 2012 → `Sept_2012_FARMS_newsletter_web.pdf` ·
October 2010 → `FARMS-Oct10NL-FARMS_Update.pdf` · September 2008 → `FARMS-Sept08NL-Bangladesh-Chittagong_Hills.pdf` ·
December 2007 → `FARMS-Dec07NL-Bangladesh.pdf` · August 2007 → `FARMS-Aug07NL-Bangladesh.pdf` ·
December 2004 → `FARMS-Dec04NL-Persecuted_Church.pdf` · May 2004 → `FARMS-May04NL-Bangladesh.pdf`

MNN: Isolation delays damage reports for ministry in Bangladesh (July 2012)

### Haiti (`#haiti`)
Newsletters: December 2016 → `Greenhouse_Haiti_Update_Email_Edition_Dec_2016.pdf` ·
August 2014 → `August_2014_Haiti_Newsletter_web_edition.pdf` · November 2011 → `Nov2011FARMSNewsletterWeb.pdf` ·
May 2010 → `FARMS-May10NL-Haiti_Letter.pdf`

MNN: Dependency in Haiti replaced with sustainability (Jan 2017) · The gift of giving in Haiti (Nov 2016)

### Moldova (`#moldova`)
Newsletters: July 2017 → `Moldova_July_2017.pdf` · December 2016 → `Greenhouse_Haiti_Update_Email_Edition_Dec_2016.pdf` ·
October 2016 → `Moldova_Philippines_update_web_ready.pdf` · December 2015 → `FARMS_Moldova_2015_Email_.pdf` ·
December 2007 → `FARMS-Dec07NL-Bangladesh.pdf` · June 2007 → `FARMS-June07NL-Moldova_Part_2.pdf` ·
March 2007 → `FARMS-March07NL-Moldova_Part_1.pdf` · March 2006 → `FARMS-March06NL-Year_in_Review.pdf` ·
November 2005 → `FARMS-November05-Moldova.pdf` · September 2005 → `FARMS-Sept05NL-Philippine-Moldova-Senegal.pdf`

MNN: Interest free, a biblical approach to lending (Jan 2017) ·
Moldova Christians growing financially and faith-fully (June 2016) ·
Loans lead to laughter in Moldova (Dec 2015)

### Nagaland/India (`#nagaland`)
Newsletters: December 2017 → `Dec2017-FARMS-newsletter.pdf` · February 2014 → `FEB_2014_newsletter_web_edition.pdf` ·
July 2004 → `FARMS-July04NL-Nagaland-India.pdf`

### The Philippines (`#philippines`)
Newsletters: October 2019 → `October 2019 E-Newsletter.pdf` · March 2018 → `FARMS-201803-newsletter.pdf` ·
December 2017 → `Dec2017-FARMS-newsletter.pdf` · October 2016 → `Moldova_Philippines_update_web_ready.pdf` ·
June 2015 → `FARMS_Philippines_June_2015_online.pdf` · March 2013 → `march2013FARMS newsletter email.pdf` ·
November 2011 → `Nov2011FARMSNewsletterWeb.pdf` · May 2008 → `FARMS-May08NL-Southern_Philippines.pdf` ·
September 2005 → `FARMS-Sept05NL-Philippine-Moldova-Senegal.pdf` · March 2005 → `FARMS-March05NL-Tsunami-Philippines.pdf`

MNN: A ministry team launches its newest program in Asia (Feb 2012)

### Thailand (`#thailand`)
Newsletters: December 2019 → `Dec2019_Thailand_Newsletter.pdf` ·
October 2017 → `Thailand Oct 2017 Enewsletter FARMS Int.pdf` ·
May 2016 → `Thailand_2016_Newsletteremail_edition.pdf` · July 2012 → `Lahu_newsletter_July_2012_Final_for_web.pdf` ·
Thailand Survey in 2011 → `FARMS-Special_Edition-_Thailand_Survey.pdf` · May 2009 → `FARMS-May09NL-Thailand.pdf` ·
November 2008 → `FARMS-Nov08NL-Asia_Update.pdf` · December 2006 → `FARMS-Dec06NL-Thailand-Mien.pdf` ·
September 2006 → `FARMS-Sept06NL-Thailand-Lahu.pdf` · May 2006 → `FARMS-May06NL-Thailand.pdf`

Videos (Fancybox): FARMS International Coffee Project Promotes Evangelism → `https://vimeo.com/43922630` ·
Lahu Choir → `https://vimeo.com/45142868`

MNN: Leadership training for new Christians in SE Asia (Sept 2016) ·
FARMS helps communities escape poverty (Sept 2016) · Coffee: more than just a morning picker-upper (May 2016) ·
Loan program helps expand Gospel influence (May 2015) · Giving the poor a break (Aug 2013) ·
What happens when you plant a seed? (Jan 2013) ·
FARMS supports theological and vocational training in Thailand (Aug 2012) ·
Thai man's crops and faith thrive (June 2009)

### Additional (`#additional`)
Heading is an empty `&nbsp;`. One newsletter: Whats Wrong with Micro-credit →
`FARMS-Sept11NL-What_is_wrong_with_microcredit.pdf`. Markup contains a stray duplicate `</a>` closing tag.

All MNN hrefs follow the pattern `https://www.mnnonline.org/news/<slug>/`.

---

## 3. Newsletter PDF library

`src/newsletters/` holds **73 PDFs** plus `Newsletter-Country Mapping.xlsx` (an internal mapping
spreadsheet that is deployed but never linked).

- **51 unique PDFs** are referenced from the homepage or resources page.
- **22 PDFs are orphaned** — deployed and reachable by direct URL, but not linked from any page:
  `August 2018 Newsletter_e-version.pdf`, `Cambodia_newsletter_web_normal.pdf`,
  `Cuba_Newsletter_Compact_Size.pdf`, `FARMS Giving Examples.pdf`, `FARMS-201805-newsletter.pdf`,
  `FARMS-April05NL-Nepal.pdf`, `FARMS-Feb08NL-Nepal.pdf`, `FARMS-January10-Microcredit_Expose.pdf`,
  `FARMS-July06NL-Ethiopia-Nagaland.pdf`, `FARMS-March04NL-Niger-Senegal.pdf`,
  `FARMS-March09NL-New_Program-Cambodia.pdf`, `FARMS-Nov07NL-Senegal_Part_2.pdf`,
  `FARMS-Nov09NL-Thanksgiving_Letter.pdf`, `FARMS-Oct06NL-Senegal-Rwanda.pdf`,
  `FARMS-Oct07NL-Senegal_Part_1.pdf`, `FARMS-Sept09NL-Rwanda.pdf`,
  `FARMS-Special_Edition-Nuts_and_Bolts.pdf`, `FARMSnov2011web.pdf`, `June2020_COVID_Newsletter.pdf`,
  `Power_to_get_wealth_email_version.pdf`, `Richter Retirement Letter_e-version.pdf`,
  `The Farms Process.pdf` (superseded by `The Farms Process 2026.pdf`).
- `sitemap.xml` lists all 73 PDFs — including the 22 orphans — and nothing else: every sitemap URL
  resolves to a file on disk, and every linked PDF is in the sitemap. The sitemap is hand-maintained, so
  this correspondence must be re-verified whenever PDFs are added or removed.

**Link integrity [verified]**: every relative `href`/`src` in index, resources, gala, and 404 resolves to
a file that exists in `src/` (107 references checked, 0 missing) after `npm run build` has generated
`src/dist/`.

---

## 4. Image assets in use

| Area | Files |
|---|---|
| Logos | `img/logo/FARMS-logo-onwhite.png` (top of homepage nav), `img/logo/FARMS-logo-onblack.png` (shrunk nav, mobile nav, resources, 404, gala) |
| Backgrounds | `img/header-bg.webp` (masthead), `img/givingbg_wide.webp` (giving), `img/coffee.webp` (coffee), `img/gala-banner.webp` (gala banner), `img/resource_bk.webp` (resources jumbotron), `img/map-image.png` (legacy projects background) |
| What We Do | `img/flyer-what-we-do.png`, `img/icons/doinggood.png`, `img/icons/biblicalapproach.png`, `img/icons/itworks.png` |
| Newsletter cards | `img/newsletter-farms-process-2026.png`, `img/MostRecent.webp`, `img/FAQs.webp`, `img/newsletter-giving-impact-2026.png`, `img/newsletter-other-ways-2026.png`, `img/newsletter-recurring-giving-2026.png` |
| Map | `img/world-map.svg` (interactive), `img/where-we-work-map.png` (`<noscript>` fallback) |
| Resources thumbnails | `img/projects/{cuba,bangladesh,haiti,moldova,nagaland,philippenes,thailand}_sm.webp`, `img/additionalResources.webp` |
| Hidden modals | `img/projects/{bangladesh_thumb,haiti,moldova,nagaland2,philippenes,thailand}.webp` |
| Seals | `img/ecfaseal.png` (local), GuideStar image hot-linked from `widgets.guidestar.org` |
| Social icons | `img/icons/{twitter,facebook,instagram}.png` |
| Icons/favicons | `favicon.ico`, `favicon.svg`, `favicon-96x96.png`, `apple-touch-icon.png`, `web-app-manifest-192x192.png`, `web-app-manifest-512x512.png`, `tile.png`, `tile-wide.png` |

Note the misspelling `philippenes` in Philippines image filenames. Most content images use `loading="lazy"`.
`img/projects/archive/` and `img/archived/` hold superseded PNG/JPG versions that are deployed but unused.

---

## 5. Third-party endpoints

| Purpose | Host / URL |
|---|---|
| Analytics | `https://www.googletagmanager.com/gtag/js?id=G-HE9ZHJ520Q` |
| Session replay | `https://www.clarity.ms/tag/4097w0tyc2` (homepage only) |
| Bot protection | `https://www.google.com/recaptcha/api.js` + `https://www.google.com/recaptcha/api/siteverify` (server-side) |
| Donations | `https://cdn.aplos.com/widgets/donations/1.0.2/donations.min.js`, `https://platform.engiven.com/give/776/widget/554` |
| Newsletter signup | `https://farmsinternational.us3.list-manage.com/subscribe/post?u=327bff531daf5aae34d2fe667&id=8269e92cdf` |
| Newsletter archive | `https://us3.campaign-archive.com/home/?u=327bff531daf5aae34d2fe667&id=8269e92cdf` |
| Video | `https://www.youtube.com/embed/…`, `https://www.youtube.com/iframe_api`, `https://player.vimeo.com/…`, `https://player.vimeo.com/api/player.js` |
| Fonts | `https://fonts.gstatic.com/…` (referenced by the local `vendor/fonts/*.css`) |
| Accreditation | `https://www.ecfa.org/MemberProfile.aspx?ID=7200`, `https://www.guidestar.org/profile/22-1776920`, `https://widgets.guidestar.org/gximage2?o=7054259&l=v4` |
| Coffee partner | `https://coffeehelpingfarms.com/` |
| Blog (modals only) | `https://blog.farmsinternational.com/search/label/<Country>` |
| Gala RSVP | `https://docs.google.com/forms/d/e/1FAIpQLSePYJkxbHTz8onzqP0GwBUTaHTx2sc1Wfjo4ELK7cTjqH-26w/viewform?embedded=true` |
| News coverage | `https://www.mnnonline.org/news/<slug>/` (20 links) |

---

## 6. Organizational facts stated on the site

Useful for copy-verification tests:

- Registered 501(c)(3) nonprofit headquartered in Minnesota; member of the Evangelical Council for
  Financial Accountability; US donations tax-deductible in part or in full, with a receipt issued.
- Mailing address: FARMS International, Inc., P.O. Box 270, Knife River, MN 55609.
- Phone: (218) 416-1961. General email: info@farmsinternational.com.
- Founded 1961 — the homepage "It Works" card renders `currentYear − 1961` years of operation.
- Scripture references shown: Galatians 6:10 (What We Do heading quotation) and an unattributed quotation
  in the "Doing Good" card.
- Coffee partnership with Twin Valley Coffee; 100% of profit supports the mission.
- Program countries named across the site's copy and map: Cuba, Honduras, Moldova, Sierra Leone,
  DR Congo, Uganda, Kenya, Rwanda, Burundi, Tanzania, Zambia, Malawi, Pakistan, India, Nepal, Bhutan,
  Bangladesh, Sri Lanka, Myanmar, Thailand, Laos, Cambodia, Vietnam, Malaysia, Indonesia, Philippines
  (26 highlighted on the map), plus Haiti, which appears in the resources page and hidden modals but is
  **not** currently highlighted on the map.
