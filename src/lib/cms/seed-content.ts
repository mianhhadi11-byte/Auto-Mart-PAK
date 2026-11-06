import type { Article, ArticleStatus, CategorySlug } from '@/lib/types';
import { blocksFromRows, contentStats, makeExcerpt, slugify } from '@/lib/utils';

type Body = ReturnType<typeof blocksFromRows>;

interface SeedArticle {
  title: string;
  category: CategorySlug;
  author: string;
  image: string;
  body: Body;
  ago?: number;
  future?: number;
  status?: ArticleStatus;
  featured?: boolean;
  trending?: boolean;
  breaking?: boolean;
  rating?: number;
  videoUrl?: string;
  tags: string[];
  sourceName?: string;
  sourceUrl?: string;
  views?: number;
  aiAssisted?: boolean;
}

function makeArticle(now: number, input: SeedArticle): Article {
  const slug = slugify(input.title);
  const status = input.status ?? 'published';
  const publishedAt =
    status === 'draft' || status === 'review'
      ? null
      : input.future
        ? new Date(now + input.future * 3600000).toISOString()
        : new Date(now - (input.ago ?? 1) * 3600000).toISOString();
  const firstParagraph = input.body.find((block) => block.style === 'normal');
  const plain = firstParagraph ? firstParagraph.children.map((child) => child.text).join('') : input.title;
  const stats = contentStats(input.body);

  return {
    id: `article-${slug}`,
    title: input.title,
    slug,
    excerpt: makeExcerpt(plain, 180),
    body: input.body,
    categorySlug: input.category,
    authorId: `author-${input.author}`,
    imageUrl: `/images/editorial/${input.image}.webp`,
    imageAlt: `${input.title} — MIC TECH editorial illustration`,
    imageCredit: 'MIC TECH Studio',
    status,
    featured: input.featured ?? false,
    trending: input.trending ?? false,
    breaking: input.breaking ?? false,
    publishedAt,
    updatedAt: new Date(
      status === 'draft' || status === 'review'
        ? now - 2 * 3600000
        : now - (input.ago ?? 1) * 3600000 + 600000,
    ).toISOString(),
    createdAt: new Date(now - ((input.ago ?? 1) + 12) * 3600000).toISOString(),
    videoUrl: input.videoUrl,
    tags: input.tags,
    seoTitle: input.title,
    seoDescription: makeExcerpt(plain, 155),
    socialCaption: `${input.title} — the full story on MIC TECH.`,
    sourceName: input.sourceName,
    sourceUrl: input.sourceUrl,
    readMinutes: stats.minutes,
    views: input.views ?? 0,
    rating: input.rating,
    aiAssisted: input.aiAssisted ?? false,
  };
}

export function buildSeedArticles(now: number): Article[] {
  const seeds: SeedArticle[] = [
    {
      title: 'The AI bottleneck has moved from silicon to the power grid',
      category: 'ai',
      author: 'daniyal-khan',
      image: 'signal-ai-mesh',
      ago: 2,
      featured: true,
      trending: true,
      breaking: true,
      views: 18420,
      tags: ['AI infrastructure', 'Data centers', 'Energy'],
      sourceName: 'MIC TECH field reporting',
      body: blocksFromRows([
        [
          'p',
          'For two years, the binding constraint on artificial intelligence looked like a supply-chain problem: find more accelerators, book more capacity, wait for the next shipment. That story is changing. In the newest data-center corridors, the question is no longer whether a company can buy compute. It is whether the local grid can deliver the power without making everything else more expensive.',
        ],
        [
          'p',
          'The shift is visible in the way projects are now announced. A generation ago, the headline number was the size of the cluster. Today it is the number of megawatts, the length of the power-purchase agreement and the substation that has to be built before a single rack can be switched on.',
        ],
        ['h2', 'The queue has moved'],
        [
          'p',
          'Grid operators in several regions have introduced fast-track queues for large industrial customers, but the timelines are still measured in years. That mismatch has created a new kind of intermediary: firms that assemble land, power and permits before they have a tenant. Their product is not compute. It is certainty.',
        ],
        [
          'p',
          'The economics are awkward. A modern training campus can consume as much electricity as a small city, yet the workload is bursty. Utilities are being asked to reserve capacity for demand that may arrive in phases, which means somebody has to pay for the wires even when the accelerators are idle.',
        ],
        [
          'quote',
          'The next competitive advantage in AI may be a signed interconnection agreement, not a model architecture.',
        ],
        ['h2', 'Efficiency is only half the answer'],
        [
          'p',
          'Better chips and liquid cooling are reducing energy per token, and every improvement helps. But efficiency has a way of expanding demand: cheaper inference invites more inference. The net effect is that total electricity use keeps climbing even as the efficiency curve improves.',
        ],
        [
          'ul',
          [
            'Long-term power contracts are becoming a board-level negotiation.',
            'Cooling and water use are now part of site selection, not an afterthought.',
            'Utilities are experimenting with flexible load agreements that reward customers for shifting work.',
          ],
        ],
        [
          'p',
          'The companies that navigate this period well will be the ones that treat energy as a product problem rather than a procurement detail. The model race is still real. But the race to power it is being run on a different track, with slower clocks and much larger capital requirements.',
        ],
      ]),
    },
    {
      title: 'The packaging floor is the new front line in the AI chip race',
      category: 'technology',
      author: 'daniyal-khan',
      image: 'signal-chip-power',
      ago: 5,
      featured: true,
      views: 11200,
      tags: ['Semiconductors', 'Advanced packaging', 'Supply chain'],
      sourceName: 'MIC TECH field reporting',
      body: blocksFromRows([
        [
          'p',
          'The most important room in a modern chip company is not always the design lab. Increasingly, it is the packaging floor, where silicon dies are assembled into a single module and the difference between a good product and an unavailable one is measured in yield.',
        ],
        ['p', 'Advanced packaging has become the quiet bottleneck of the AI buildout. The logic is simple: as chipmakers push more compute into a single package, the number of delicate connections rises, the tolerance for error falls, and the cost of a failed batch climbs.'],
        ['h2', 'Why chiplets changed the math'],
        [
          'p',
          'Chiplets let designers mix and match components instead of building one enormous die. That flexibility is valuable, but it moves complexity into assembly. A package may combine compute tiles, memory stacks and an interposer, each with its own thermal profile and testing regime.',
        ],
        [
          'p',
          'The result is a manufacturing process that behaves less like a printing press and more like a precision assembly line. Capacity cannot be added by buying one machine. It requires cleanrooms, trained technicians, substrates and time.',
        ],
        ['quote', 'The leading edge is no longer just a transistor problem. It is a packaging, materials and logistics problem at the same time.'],
        ['h2', 'A more distributed map'],
        [
          'p',
          'Governments have noticed. Subsidy packages that once focused on fabs are now being rewritten to include packaging and testing. The strategic logic is straightforward: afab without a way to package its output is not a supply chain. It is a very expensive cleanroom.',
        ],
        [
          'p',
          'For buyers, the practical consequence is that lead times will remain volatile even if wafer supply improves. The constraint keeps moving around the chain, and the companies that model it in detail will have a better year than the ones that assume a single bottleneck.',
        ],
      ]),
    },
    {
      title: 'Kestrel Cloud raises $42M to build sovereign AI infrastructure',
      category: 'startups',
      author: 'mira-sethi',
      image: 'signal-startup-capital',
      ago: 7,
      featured: true,
      trending: true,
      views: 9860,
      tags: ['Funding', 'Cloud', 'Sovereign AI'],
      sourceName: 'Company filing and MIC TECH interview',
      body: blocksFromRows([
        [
          'p',
          'Kestrel Cloud, a regional infrastructure startup that sells private AI compute to governments and regulated industries, has raised $42 million in a Series A round led by Northline Capital. The company says the capital will fund two new data-center sites and a control plane designed to keep customer data inside national borders.',
        ],
        ['h2', 'Sovereignty as a product'],
        [
          'p',
          'The pitch is not faster chips. It is jurisdiction. Kestrel packages compute, storage and model serving into a managed environment that can be deployed in a customer’s country, with audit logs and key management controlled locally. For public-sector buyers, that is often the difference between a pilot and a procurement.',
        ],
        [
          'p',
          'The company declined to disclose revenue, but said annual contracted value tripled over the past year. Its customers include two agencies and a group of financial institutions, according to a person familiar with the business.',
        ],
        ['quote', 'The demand is not for another model. It is for a place to run the model where the rules make sense.'],
        ['h2', 'The hard part is not the building'],
        [
          'p',
          'Kestrel is entering a crowded field. Cloud incumbents are opening local regions, hardware vendors are bundling private deployments, and consultancies are assembling sovereign cloud offerings from existing parts. The startup’s advantage will depend on whether it can turn compliance into a repeatable product rather than a series of bespoke projects.',
        ],
        [
          'p',
          'The round values the company at approximately $310 million post-money, according to two people with knowledge of the terms. Kestrel plans to hire 70 people over the next year, with most of the roles in security, field engineering and operations.',
        ],
        [
          'p',
          'For the region’s startup ecosystem, the signal matters as much as the number. Infrastructure companies take longer to build than consumer apps, but they create durable capacity. The next test is whether the contracts turn into utilization.',
        ],
      ]),
    },
    {
      title: 'Foldables are growing up — and the hinge is finally doing the work',
      category: 'mobile',
      author: 'omar-farooq',
      image: 'signal-device-fold',
      ago: 9,
      featured: true,
      views: 8740,
      tags: ['Foldables', 'Smartphones', 'Hardware'],
      sourceName: 'MIC TECH device lab',
      body: blocksFromRows([
        [
          'p',
          'The first generation of foldables asked buyers to tolerate a lot: a visible crease, a fragile display and a hinge that felt like a mechanical apology. The newest devices are not perfect, but they have crossed an important line. They feel like products rather than prototypes.',
        ],
        ['h2', 'The hinge stops being the story'],
        [
          'p',
          'A new generation of water-drop hinges has reduced the crease to something you notice only at an angle. More importantly, the mechanisms are rated for more cycles and are easier to service. That changes the ownership experience: a foldable no longer feels like a bet against your own carelessness.',
        ],
        [
          'p',
          'The improvements are not uniform. Some devices still collect dust at the hinge, and repair costs remain high. But the gap between a foldable and a conventional flagship is narrowing in the places that matter day to day.',
        ],
        ['quote', 'The best foldable is the one you stop thinking about after the first week.'],
        ['h2', 'Software is catching up'],
        [
          'p',
          'The larger inner display used to be a canvas in search of a use case. App continuity is now better, multitasking gestures are more predictable, and tablet-style layouts are appearing in more apps. The result is a device that behaves differently depending on how you hold it, without demanding that you learn a new operating system.',
        ],
        [
          'p',
          'The remaining question is price. Foldables still carry a premium that is difficult to justify for most buyers. But the category no longer needs to be defended on novelty alone. It is becoming a legitimate choice for people who want a small phone and a large screen in the same pocket.',
        ],
      ]),
    },
    {
      title: 'The 1,400 km electric road trip that exposed the gaps in charging',
      category: 'automobile',
      author: 'usman-tariq',
      image: 'signal-auto-grid',
      ago: 11,
      trending: true,
      views: 14300,
      tags: ['EV', 'Charging', 'Road trip'],
      sourceName: 'MIC TECH mobility test',
      body: blocksFromRows([
        [
          'p',
          'The route looked straightforward on paper: 1,400 kilometers across three regions, two mountain passes and a stretch of highway with almost no services. The car had a rated range of 520 kilometers. The charging map showed a reassuring number of pins. The reality was more complicated.',
        ],
        ['h2', 'The first stop sets the tone'],
        [
          'p',
          'The first charging site was listed as available. It was available in the sense that the stall existed. The connector was compatible, the payment app worked after a second attempt, and the charger delivered 38 kW instead of the advertised 150 kW. We added 90 minutes to the day before we had left the first province.',
        ],
        ['p', 'This is the gap that specifications do not capture. A charger can be online, compatible and still not deliver the experience the map promised.'],
        ['h2', 'Where the network worked'],
        [
          'p',
          'The best stops were not the newest. They were the ones with shade, working screens, a nearby café and a support number that answered. Reliability, it turns out, is a hospitality problem as much as an engineering problem.',
        ],
        ['ul', [
          'Highway corridor sites outperformed urban locations for availability.',
          'Payment interoperability improved, but app fragmentation remains a friction point.',
          'Battery preconditioning made a measurable difference in cold mountain sections.',
        ]],
        [
          'p',
          'The trip finished with a 22 percent battery buffer and a long list of notes. The car was capable. The network was mostly capable. The missing piece was the layer between them: clear, trustworthy information about what a stop will actually feel like.',
        ],
      ]),
    },
    {
      title: 'Smaller, sharper, cheaper: the new economics of open-weight models',
      category: 'ai',
      author: 'daniyal-khan',
      image: 'signal-frontier-model',
      ago: 13,
      trending: true,
      views: 12240,
      tags: ['Open source', 'AI models', 'Inference'],
      sourceName: 'MIC TECH analysis',
      body: blocksFromRows([
        [
          'p',
          'The most interesting race in artificial intelligence is no longer only about the largest model. It is about the smallest model that is good enough for a specific job — and how cheaply it can be run.',
        ],
        ['p', 'Open-weight releases have made that question practical. A team can now download a model, fine-tune it on a narrow task and deploy it on hardware that costs less than a monthly cloud bill. The result is not always better than a frontier API, but it is often enough.'],
        ['h2', 'The middle of the market'],
        [
          'p',
          'The action is in the middle: models small enough to run affordably, but capable enough to handle structured work. Customer support, document extraction, coding assistance and internal search are all being rebuilt around this trade-off.',
        ],
        ['quote', 'The frontier still matters. The margin is being made somewhere behind it.'],
        ['h2', 'What changes for buyers'],
        [
          'p',
          'For companies, the calculus is shifting from which model is smartest to which model is cheapest to operate at acceptable quality. That requires evaluation, not intuition. It also requires a plan for model swaps, because the best option will change again in a few months.',
        ],
        [
          'p',
          'The open-weight wave will not make frontier labs irrelevant. It will make the market more layered. The most valuable skill may be knowing which layer a problem belongs in.',
        ],
      ]),
    },
    {
      title: 'Chip equipment orders point to a capex cycle with a longer tail',
      category: 'business',
      author: 'mira-sethi',
      image: 'signal-business-cycle',
      ago: 16,
      views: 6840,
      tags: ['Semiconductors', 'Markets', 'Capital spending'],
      body: blocksFromRows([
        [
          'p',
          'The quarterly numbers from chip-equipment suppliers are usually a leading indicator for the entire technology supply chain. This quarter’s message is not a boom. It is a longer cycle, with more of the spending pushed into advanced packaging, power delivery and the unglamorous equipment that keeps fabs running.',
        ],
        ['h2', 'Spending is broadening'],
        [
          'p',
          'The headline growth in lithography has cooled, but orders for deposition, inspection and testing equipment have held up. That pattern suggests customers are not simply buying more of the same. They are building for a different mix of products, including AI accelerators and the memory that feeds them.',
        ],
        ['p', 'Analysts caution that backlog is not revenue. Some orders are scheduled years out, and cancellation terms vary. Still, the direction is clear enough to support a more optimistic view of 2027 than the market held three months ago.'],
        ['quote', 'The equipment order book is a promise. The installation schedule is the reality.'],
        ['h2', 'The risk is concentration'],
        [
          'p',
          'A small number of customers account for a large share of the advanced equipment market. That makes the cycle powerful when it turns up and painful when it turns down. Suppliers are trying to diversify into automotive, industrial and energy applications, but those markets move at a different speed.',
        ],
        [
          'p',
          'For investors, the story is less about a single quarter than about the physical buildout of compute. That buildout has a long tail, and the companies selling the tools will see it before the rest of us do.',
        ],
      ]),
    },
    {
      title: 'Regulator sets 90-day deadline for 5G quality reporting',
      category: 'telecom',
      author: 'sana-iqbal',
      image: 'signal-telecom-spectrum',
      ago: 17,
      breaking: true,
      views: 7920,
      tags: ['5G', 'Regulation', 'Networks'],
      sourceName: 'MIC TECH policy desk',
      body: blocksFromRows([
        [
          'p',
          'Telecom operators will be required to publish standardized 5G quality data every 90 days under a new reporting framework announced by the regulator. The rules cover coverage, call setup success, throughput and latency, and are intended to make it easier for customers to compare networks without relying on marketing claims.',
        ],
        ['h2', 'A common scorecard'],
        [
          'p',
          'The framework introduces a shared methodology for measurements. Operators will submit drive-test data and network logs to an independent auditor, and the results will be published in a searchable portal. The first reporting cycle begins next quarter.',
        ],
        ['p', 'Industry groups have broadly welcomed the move, though some operators have asked for more time to align legacy systems. Consumer advocates say the deadlines are reasonable but the penalties for non-compliance need to be clearer.'],
        ['quote', 'Coverage maps are marketing. Measurement is accountability.'],
        ['h2', 'What it means for customers'],
        [
          'p',
          'The immediate effect will be better data, not better reception. Over time, the hope is that transparent comparisons will push investment toward the places where quality lags. The framework also creates a baseline for regulators to intervene when an operator repeatedly misses targets.',
        ],
        ['p', 'The first published results will be the real test. A scorecard is only useful if it is updated, audited and enforced.'],
      ]),
    },
    {
      title: 'Why social platforms are betting on private group chats again',
      category: 'social-media',
      author: 'hira-nadeem',
      image: 'signal-social-private',
      ago: 19,
      views: 6540,
      tags: ['Social media', 'Messaging', 'Product'],
      body: blocksFromRows([
        [
          'p',
          'The pendulum is swinging back to small rooms. After years of building public feeds designed for reach, several social platforms are investing in private groups, shared spaces and messaging features that look more like the early internet than the modern attention economy.',
        ],
        ['h2', 'The reach problem'],
        [
          'p',
          'Public posts can travel far, but they are increasingly hard to monetize and harder to trust. Private groups produce fewer impressions, but they generate repeated visits, richer signals and less moderation risk. For platforms under pressure to show durable engagement, that trade-off is attractive.',
        ],
        ['p', 'The feature sets are converging. Groups get their own feeds, events, shared media and lightweight moderation tools. The platform becomes less of a stage and more of a place to spend time.'],
        ['quote', 'Reach is a metric. Belonging is a habit.'],
        ['h2', 'The moderation bill'],
        [
          'p',
          'Private spaces are not automatically safer. They can make harmful content harder to detect and harder to remove, while pushing responsibility onto volunteer moderators. Platforms will need to decide how much visibility they want into the rooms they host, and how they explain that trade-off to users.',
        ],
        [
          'p',
          'The next phase of social products may be less about broadcasting to everyone and more about making a small group feel worth returning to. That is a different design problem, and a harder one to scale.',
        ],
      ]),
    },
    {
      title: 'AI tutors are entering classrooms. The evidence is still catching up.',
      category: 'education',
      author: 'nadia-shah',
      image: 'signal-education-ai',
      ago: 21,
      views: 5930,
      tags: ['AI', 'Education', 'Policy'],
      sourceName: 'MIC TECH education desk',
      body: blocksFromRows([
        [
          'p',
          'The pitch is compelling: a patient tutor for every student, available at any hour, able to adapt to the pace of the learner. Schools are piloting AI tutoring tools at a pace that has outpaced the research base, and the early results are mixed in ways that matter.',
        ],
        ['h2', 'What the pilots show'],
        [
          'p',
          'Several districts report modest gains in completion rates for practice exercises, especially when the tool is used during class and a teacher is present. Gains are harder to find when students use the tools alone at home. The difference appears to be supervision, not the model.',
        ],
        ['p', 'Researchers also warn about a measurement problem. Engagement metrics look impressive because the tools are designed to be engaging. Learning is slower, noisier and harder to attribute to a single product.'],
        ['quote', 'A tool can hold attention without teaching anything. The two are not the same.'],
        ['h2', 'The teacher in the loop'],
        [
          'p',
          'The most promising implementations treat AI as a teaching assistant rather than a replacement. It drafts practice questions, summarizes common mistakes and gives teachers a clearer view of where a class is stuck. That is less exciting than a robot tutor, and more useful.',
        ],
        [
          'p',
          'The policy question is not whether AI belongs in classrooms. It is already there. The question is what evidence schools should demand before they sign a multi-year contract, and who is accountable when the tool is wrong.',
        ],
      ]),
    },
    {
      title: 'A practical guide to securing your digital life in 2026',
      category: 'guides',
      author: 'zain-abbas',
      image: 'signal-guide-security',
      ago: 23,
      views: 15780,
      tags: ['Security', 'Passwords', 'Privacy', 'Guides'],
      body: blocksFromRows([
        [
          'p',
          'Security advice has a tendency to sound like homework. The good news is that the highest-impact changes take an afternoon, not a month. This guide focuses on the handful of habits that actually reduce risk for a normal person with a phone, a laptop and a growing pile of accounts.',
        ],
        ['h2', 'Start with the account that can reset everything'],
        [
          'p',
          'Your email account is the master key. Secure it first. Use a long, unique password stored in a password manager, turn on two-factor authentication, and print or store recovery codes somewhere that is not your phone.',
        ],
        ['h2', 'Use passkeys where they exist'],
        [
          'p',
          'Passkeys remove the password from the login flow and replace it with a cryptographic credential tied to your device. They are faster, resistant to phishing and increasingly available. Start with the accounts you use every day, but keep a backup method configured.',
        ],
        ['ul', [
          'Turn on automatic updates for your phone, browser and password manager.',
          'Use a separate email address for low-trust signups.',
          'Review app permissions once a quarter and remove what you do not need.',
          'Back up your authenticator app or store recovery codes offline.',
        ]],
        ['h2', 'Assume the breach will happen'],
        [
          'p',
          'The goal is not to prevent every incident. It is to make one incident boring. Unique passwords, two-factor authentication and backups turn a potential catastrophe into an inconvenience. That is the standard worth aiming for.',
        ],
      ]),
    },
    {
      title: 'Vela Airbook 14 review: the quiet case for a laptop that just works',
      category: 'reviews',
      author: 'zain-abbas',
      image: 'signal-review-laptop',
      ago: 25,
      rating: 8.7,
      views: 13110,
      tags: ['Laptops', 'Reviews', 'Vela'],
      sourceName: 'MIC TECH test bench',
      body: blocksFromRows([
        [
          'p',
          'The Vela Airbook 14 does not try to win a spec-sheet argument. It has a modest processor, a good but not exceptional screen and a design that would disappear into a coffee shop. After two weeks of daily use, that restraint started to feel like the point.',
        ],
        ['h2', 'The case for boring'],
        [
          'p',
          'The keyboard is the best part. Travel is deep enough to type on for hours, the layout is sensible and the trackpad is accurate without being oversensitive. The hinge holds the screen at any angle, and the chassis does not flex when you pick it up by a corner.',
        ],
        [
          'p',
          'Battery life landed at just over 11 hours of mixed work at 50 percent brightness. That is not a record, but it is enough to leave the charger at home. The fan stays off during browsing and document work, and becomes audible only under sustained load.',
        ],
        ['h2', 'Where it gives ground'],
        [
          'p',
          'The display covers 100 percent of sRGB but not the wider color gamuts that creators may want. Port selection is reasonable but not generous. And the webcam is merely fine, which is disappointing at this price.',
        ],
        ['quote', 'The Airbook 14 is not the most exciting laptop we tested this year. It is the one we kept reaching for.'],
        ['h2', 'The verdict'],
        [
          'p',
          'At $1,199, the Airbook 14 is a sensible choice for knowledge workers who value reliability over benchmarks. It is not the right machine for heavy rendering or gaming, and Vela’s upgrade pricing is still annoying. But as a daily tool, it earns its place.',
        ],
      ]),
    },
    {
      title: 'Context-aware earbuds are here. They still misunderstand the room.',
      category: 'gadgets',
      author: 'omar-farooq',
      image: 'signal-review-audio',
      ago: 28,
      views: 7620,
      tags: ['Audio', 'Wearables', 'Gadgets'],
      sourceName: 'MIC TECH test bench',
      body: blocksFromRows([
        [
          'p',
          'The new generation of earbuds can detect when you start speaking, lower the music, amplify the conversation and switch back when you stop. On paper, it is the most useful feature audio products have added in years. In practice, the room always has other ideas.',
        ],
        ['h2', 'The good part'],
        [
          'p',
          'When it works, it is genuinely magical. A barista asks a question, the music fades, the microphones focus on the voice in front of you, and the conversation ends without you touching your phone. The best implementations feel like a polite assistant rather than a gadget.',
        ],
        ['p', 'Noise cancellation is strong, battery life is solid and the case is small enough to live in a pocket. The fit is comfortable for long stretches, though the buds are not the most secure for running.'],
        ['h2', 'The difficult part'],
        [
          'p',
          'Context detection is still fragile. A nearby television can trigger conversation mode. A passing bus can make the buds overcorrect. And in a crowded room, the system sometimes amplifies the wrong voice with complete confidence.',
        ],
        ['quote', 'The feature is impressive in a demo and inconsistent in a life.'],
        ['p', 'These are early-days problems, not fatal ones. The direction is right. The next version needs fewer party tricks and more restraint.'],
      ]),
    },
    {
      title: 'Open source is not a business model. It is infrastructure.',
      category: 'opinion',
      author: 'hamza-raza',
      image: 'signal-opinion-open',
      ago: 30,
      views: 8820,
      tags: ['Open source', 'Business models', 'Opinion'],
      body: blocksFromRows([
        [
          'p',
          'Every few months, someone announces that open source is broken. The complaint is usually the same: companies build enormous businesses on top of community software and return very little. The diagnosis is correct. The proposed cure — make the license more restrictive — often misses the point.',
        ],
        ['h2', 'The wrong question'],
        [
          'p',
          'The question is not how to turn open source into a conventional business. It is how to fund infrastructure that behaves like roads, standards and water systems. Some of it will be commercial. Some of it will need public or cooperative support. Pretending one model fits everything is how projects get abandoned.',
        ],
        ['quote', 'We do not ask a bridge to monetize its users. We ask it to stay standing.'],
        ['h2', 'What actually helps'],
        [
          'p',
          'Companies that depend on open source can fund maintainers directly, pay for support and contribute engineering time. Foundations can provide legal and operational cover. Governments can treat critical libraries as public infrastructure. None of these is glamorous, and all of them are more useful than another license debate on social media.',
        ],
        [
          'p',
          'Open source is not a marketing strategy or a pricing tactic. It is a way of building shared infrastructure. The sooner we fund it like infrastructure, the fewer emergencies we will have to explain.',
        ],
      ]),
    },
    {
      title: 'Software-defined cars are arriving. The repair shop is not ready.',
      category: 'automobile',
      author: 'usman-tariq',
      image: 'signal-auto-software',
      ago: 33,
      views: 5910,
      tags: ['Automotive', 'Software', 'Repair'],
      body: blocksFromRows([
        [
          'p',
          'A modern car is a network on wheels. It has dozens of computers, over-the-air update capability and software that controls everything from braking to cabin climate. The industry calls this a software-defined vehicle. Independent repair shops call it something less polite.',
        ],
        ['h2', 'The diagnostic gap'],
        [
          'p',
          'Access to diagnostic tools is uneven. Some manufacturers sell short-term subscriptions. Others require proprietary hardware. The result is that a routine repair can become a dealer-only event, not because the work is difficult but because the information is locked away.',
        ],
        ['p', 'Right-to-repair advocates say the problem will get worse as more functions move into software. A physical part may be replaceable, but the car may refuse to recognize it without an authorized pairing step.'],
        ['quote', 'The car is becoming a subscription. The repair shop is becoming a customer-service desk.'],
        ['h2', 'A path forward'],
        [
          'p',
          'The solutions are not mysterious: standardized diagnostic interfaces, fair access to repair information, and a clear right to use compatible parts. Some regulators are moving in that direction. The industry’s resistance is predictable, but the safety argument for locking systems is weaker than the commercial one.',
        ],
        [
          'p',
          'Software can make cars safer and better. It should not make ownership more fragile. The repair ecosystem needs to be designed in, not bolted on after the warranty expires.',
        ],
      ]),
    },
    {
      title: 'Satellite messaging moves from emergency feature to everyday utility',
      category: 'telecom',
      author: 'sana-iqbal',
      image: 'signal-telecom-orbit',
      ago: 36,
      views: 6120,
      tags: ['Satellites', 'Connectivity', 'Telecom'],
      body: blocksFromRows([
        [
          'p',
          'Satellite messaging began as a safety feature: a way to send a short distress message when there was no cell signal. The next phase is less dramatic. Operators are pitching satellite links as a routine backup for messages, location sharing and low-bandwidth updates.',
        ],
        ['h2', 'The technical shift'],
        [
          'p',
          'New constellations and better modems have reduced the power needed to reach a satellite. That makes it possible to integrate the feature into ordinary phones rather than bulky specialty devices. The coverage is still limited by sky visibility and capacity, but the gap between “emergency” and “everyday” is closing.',
        ],
        ['p', 'Carriers are experimenting with tiered plans. A basic safety tier may be bundled with premium plans, while data-heavy uses remain expensive. The pricing will determine whether satellite becomes a genuine backup or another feature people ignore.'],
        ['quote', 'The killer app for satellite is not video. It is a message that gets through.'],
        ['h2', 'A crowded sky'],
        [
          'p',
          'Regulators are still working out how to manage interference, orbital debris and spectrum sharing. The commercial momentum is real, but the governance is lagging. That is a familiar pattern in space, and it rarely ends neatly.',
        ],
      ]),
    },
    {
      title: 'Water intelligence startup Tidal Scope closes a $9M seed round',
      category: 'startups',
      author: 'mira-sethi',
      image: 'signal-data-center',
      ago: 40,
      views: 3880,
      tags: ['Funding', 'Climate tech', 'Infrastructure'],
      sourceName: 'Company filing and MIC TECH interview',
      body: blocksFromRows([
        [
          'p',
          'Tidal Scope, a startup that uses sensor networks and machine learning to detect leaks in municipal water systems, has raised $9 million in seed funding. The round was led by Common Ground Ventures, with participation from two infrastructure funds.',
        ],
        ['h2', 'A boring problem with a large bill'],
        [
          'p',
          'Water utilities lose a significant share of treated water before it reaches a customer. The causes are mundane: aging pipes, pressure changes and leaks that are expensive to find. Tidal Scope’s pitch is that existing sensors already produce enough data to prioritize repairs.',
        ],
        ['p', 'The company says its software is deployed across four municipal networks and has helped clients reduce non-revenue water by double digits in pilot areas. Those results have not been independently audited, and the startup declined to name the utilities.'],
        ['quote', 'The best climate technology is often the least photogenic. Fixing a pipe is not a demo.'],
        ['h2', 'The sales cycle is the challenge'],
        [
          'p',
          'Selling to utilities is slow, procurement-heavy work. Tidal Scope plans to use the funding to build a partner network of engineering firms that can bundle its software with existing service contracts. That could shorten the path to revenue, or dilute the product story.',
        ],
        [
          'p',
          'The round is a bet that infrastructure software can be both useful and durable. It will take more than a pilot to prove it.',
        ],
      ]),
    },
    {
      title: 'The smart lock that finally respects the boring use case',
      category: 'gadgets',
      author: 'omar-farooq',
      image: 'signal-lock',
      ago: 43,
      views: 4980,
      tags: ['Smart home', 'Security', 'Gadgets'],
      sourceName: 'MIC TECH test bench',
      body: blocksFromRows([
        [
          'p',
          'Most smart locks are designed for the version of your life where you orchestrate scenes from a phone. The Aperture Lock 2 is designed for the version where your hands are full and the door needs to open. That difference makes it one of the more sensible connected devices we have tested.',
        ],
        ['h2', 'The basics, done well'],
        [
          'p',
          'The lock replaces a standard deadbolt and keeps a physical key slot. Auto-unlock works reliably within a few meters, the keypad is responsive and the app does not require an account for local use. Battery life is rated at nine months and the unit warns you well before it dies.',
        ],
        ['p', 'It is not the prettiest lock on the market, and the app’s notification settings are overly complicated. But the core experience is boring in the best way.'],
        ['h2', 'The security question'],
        [
          'p',
          'A connected lock is only as trustworthy as its update process. Aperture has published a clear disclosure policy and supports local firmware updates. That is a good start. Buyers should still ask what happens if the company disappears, and whether the lock keeps working without a cloud account.',
        ],
        ['quote', 'A good smart lock should be less noticeable than the key it replaces.'],
      ]),
    },
    {
      title: 'Quantum networking leaves the lab: three pilots to watch',
      category: 'technology',
      author: 'daniyal-khan',
      image: 'signal-quantum',
      ago: 46,
      views: 5220,
      tags: ['Quantum', 'Networking', 'Research'],
      body: blocksFromRows([
        [
          'p',
          'Quantum networking has spent years as a laboratory curiosity. That is starting to change, slowly. Three publicly funded pilots are testing whether quantum key distribution and entangled-node links can survive contact with real fiber, real weather and real procurement.',
        ],
        ['h2', 'What the pilots are testing'],
        [
          'p',
          'The projects differ in scope. One links two research campuses across a metropolitan fiber ring. Another is testing trusted-node relays over a longer regional route. The third is focused on timing and synchronization, which sounds less exciting and may be more important.',
        ],
        ['p', 'None of these is a quantum internet. They are infrastructure experiments, designed to find the failure modes that lab demonstrations hide. That makes them worth watching even if commercial timelines remain uncertain.'],
        ['quote', 'The useful question is not when quantum networking arrives. It is which parts of the stack break first.'],
        ['h2', 'The practical bottleneck'],
        [
          'p',
          'Fiber loss, detector noise and the cost of cryogenic equipment remain stubborn constraints. So does the workforce: very few engineers have hands-on experience with quantum links. The pilots are as much about training people as proving technology.',
        ],
        [
          'p',
          'The near-term value may come from adjacent work: better timing systems, more secure key management and improved fiber monitoring. Those are useful even if the quantum link itself stays experimental.',
        ],
      ]),
    },
    {
      title: 'The boring infrastructure companies quietly winning the AI boom',
      category: 'business',
      author: 'mira-sethi',
      image: 'signal-business-cycle',
      ago: 49,
      trending: true,
      views: 8370,
      tags: ['Markets', 'Infrastructure', 'AI'],
      body: blocksFromRows([
        [
          'p',
          'The most valuable companies in the AI boom are not all building models. Many are selling the things a model needs to exist: power distribution, cooling, networking, testing and the software that keeps a data center from becoming an expensive heater.',
        ],
        ['h2', 'Where the money is flowing'],
        [
          'p',
          'Earnings calls across the industrial sector have a new vocabulary. Order books are being described in terms of data-center demand. Companies that once sold to utilities are now being asked about liquid cooling. The re-rating is happening fastest in the least glamorous corners.',
        ],
        ['p', 'This is not a bubble-proof story. Infrastructure spending is cyclical, and some of the current optimism assumes continued AI demand at today’s growth rate. But the revenue is more tangible than a valuation multiple.'],
        ['quote', 'Every model runs on something physical. That is where the durable margin tends to hide.'],
        ['h2', 'The risk of being a pickup truck'],
        [
          'p',
          'The danger is that infrastructure companies become commodity suppliers during the buildout, then face a brutal pricing reset when demand normalizes. The ones with proprietary components, service contracts and switching costs will fare better. The rest may discover that scale is not a moat.',
        ],
      ]),
    },
    {
      title: 'The repairable phone is back — and it is not a compromise',
      category: 'mobile',
      author: 'omar-farooq',
      image: 'signal-device-glass',
      ago: 53,
      views: 9410,
      tags: ['Smartphones', 'Repair', 'Design'],
      sourceName: 'MIC TECH device lab',
      body: blocksFromRows([
        [
          'p',
          'For years, repairability was treated as a niche virtue: admirable, but incompatible with the thinness and water resistance that premium phones demanded. A new generation of devices is testing that assumption. The results are more interesting than the marketing.',
        ],
        ['h2', 'Designing for the screwdriver'],
        [
          'p',
          'The best repairable phones are not modular in the toy-like sense. They use standard fasteners, accessible batteries and displays that can be replaced without removing the entire chassis. The trade-offs are real, but they are measured in millimeters rather than user experience.',
        ],
        ['p', 'Parts pricing remains the weak link. A phone that is easy to open is not truly repairable if the replacement screen costs most of the purchase price. Manufacturers will need to publish fair parts prices and make diagnostic software available.'],
        ['quote', 'Repairability is not a feature. It is a promise about what happens after the warranty.'],
        ['h2', 'The market signal'],
        [
          'p',
          'Regulators are pushing in the same direction, and buyers are keeping phones longer. That combination makes durability a commercial advantage rather than a compliance cost. The repairable phone is no longer a protest product. It is becoming a credible one.',
        ],
      ]),
    },
    {
      title: 'Creators want better analytics, not another monetization badge',
      category: 'social-media',
      author: 'hira-nadeem',
      image: 'signal-social-creator',
      ago: 56,
      views: 4710,
      tags: ['Creators', 'Platforms', 'Analytics'],
      body: blocksFromRows([
        [
          'p',
          'Platforms keep adding ways for creators to earn money. Creators keep asking for something less exciting: better data about what is actually working. The gap between those two agendas is shaping the next round of product roadmaps.',
        ],
        ['h2', 'The dashboard problem'],
        [
          'p',
          'Most creator dashboards show reach, engagement and watch time. Few explain why a post performed differently from the one before it. The result is a guessing game dressed up as strategy, with creators optimizing for whatever number the platform recently decided to promote.',
        ],
        ['p', 'The most requested features are mundane: cohort comparisons, retention curves, traffic-source breakdowns and exportable data. Those tools do not generate headlines, but they would make the platform more useful.'],
        ['quote', 'Creators do not need another badge. They need to know which decisions to repeat.'],
        ['h2', 'Why analytics are hard to ship'],
        [
          'p',
          'Better analytics can reveal uncomfortable truths about a platform’s own recommendations. They also create support burden and competitive exposure. That may explain why progress is slow, even as monetization features arrive on schedule.',
        ],
        [
          'p',
          'The platform that treats creators as operators rather than audiences will earn a deeper relationship. That is a harder product than a payout button, and likely a more durable one.',
        ],
      ]),
    },
    {
      title: 'A new credential model is taking shape outside the degree',
      category: 'education',
      author: 'nadia-shah',
      image: 'signal-education-ai',
      ago: 60,
      views: 3910,
      tags: ['Credentials', 'Skills', 'Education'],
      body: blocksFromRows([
        [
          'p',
          'The degree is not disappearing. But the monopoly it once held over hiring is weakening. Employers in technical fields are experimenting with skills-based credentials, portable assessments and apprenticeship pipelines that sit alongside traditional education.',
        ],
        ['h2', 'What employers actually want'],
        [
          'p',
          'Hiring managers say the problem is not a lack of applicants. It is a lack of evidence. A credential is useful when it tells them something specific about what a candidate can do. That is why short, verifiable assessments are gaining ground.',
        ],
        ['p', 'The risk is a new layer of gatekeeping. Badges can be as arbitrary as degrees if they are not transparent, portable and independently assessed. The good ones publish their criteria and expire when the underlying skill changes.'],
        ['quote', 'A credential is only useful if it reduces uncertainty. Otherwise it is just another logo.'],
        ['h2', 'The role of universities'],
        [
          'p',
          'Universities are not standing still. Several are embedding industry certifications into degree programs and offering stackable modules for working adults. The most credible models preserve the breadth of a degree while adding proof of specific capability.',
        ],
        [
          'p',
          'The transition will be uneven. But the direction is clear: learners want evidence they can carry between jobs, and employers want proof they can trust. The institutions that solve that will matter more than the ones that defend the old format.',
        ],
      ]),
    },
    {
      title: 'How to choose a laptop that will last five years',
      category: 'guides',
      author: 'zain-abbas',
      image: 'signal-guide-laptop',
      ago: 64,
      views: 11940,
      tags: ['Laptops', 'Buying guide', 'Guides'],
      body: blocksFromRows([
        [
          'p',
          'A laptop is a long-term relationship disguised as a purchase. The spec sheet tells you how it performs on day one. The things that matter for year five are harder to see: serviceability, thermals, port selection and whether the company still supports the machine with parts and updates.',
        ],
        ['h2', 'Start with the boring constraints'],
        [
          'p',
          'Decide what you need before you browse. Will you carry it every day? Do you need a dedicated GPU? Are you willing to use a dock? The answers will narrow the market faster than any benchmark.',
        ],
        ['ul', [
          'Buy more RAM than you need today if it is soldered and cannot be upgraded.',
          'Check the battery replacement process before you buy.',
          'Prefer a machine with a documented update policy.',
          'Budget for a good external monitor before upgrading to a faster chip.',
        ]],
        ['h2', 'Read the service manual'],
        [
          'p',
          'It sounds excessive. It is the single best predictor of whether a laptop will age well. If the manufacturer publishes a service manual with part numbers, the machine is more likely to be repairable. If not, assume the battery and storage are permanent.',
        ],
        ['h2', 'Spend where you feel it'],
        [
          'p',
          'A better keyboard, a brighter screen and a quieter fan will improve more workdays than a 10 percent faster processor. The best laptop is not the one with the highest score. It is the one that gets out of the way.',
        ],
      ]),
    },
    {
      title: 'The productivity gains are real. So is the anxiety.',
      category: 'opinion',
      author: 'hamza-raza',
      image: 'signal-opinion-work',
      ago: 68,
      views: 7320,
      tags: ['Future of work', 'AI', 'Opinion'],
      body: blocksFromRows([
        [
          'p',
          'The argument about AI and work has become a shouting match between two unsatisfying stories. In one, the technology is a harmless tool that will create more jobs than it destroys. In the other, it is a wave that will wash away entire professions. Both stories are too tidy for what is actually happening.',
        ],
        ['h2', 'The task is not the job'],
        [
          'p',
          'AI is good at specific tasks: drafting, summarizing, classifying, generating variations. A job is a bundle of tasks, relationships and judgment. Automating the typing does not automatically automate the responsibility. That is why the productivity gains can be real and the anxiety can be real at the same time.',
        ],
        ['quote', 'The interesting question is not whether AI can do your job. It is which parts of your job stop being worth paying for.'],
        ['h2', 'What good adaptation looks like'],
        [
          'p',
          'Organizations that handle this well will invest in judgment, not just tooling. They will train people to verify outputs, restructure workflows rather than layer AI on top of broken ones, and be honest about which roles are changing. That is slower than a keynote and more useful than a layoff memo.',
        ],
        [
          'p',
          'The anxiety will not disappear because we tell people to be optimistic. It will recede when workers can see a path from their current skills to the next version of their job. That is a management problem before it is a technology problem.',
        ],
      ]),
    },
    {
      title: 'The browser is becoming an operating system again',
      category: 'technology',
      author: 'daniyal-khan',
      image: 'signal-agent-protocol',
      ago: 72,
      views: 6640,
      tags: ['Browsers', 'Agents', 'Software'],
      body: blocksFromRows([
        [
          'p',
          'The browser spent the last decade as a window onto other people’s software. Now it is becoming a place where software runs on your behalf. That shift is subtle, but it changes the security model, the competitive landscape and the meaning of a “web page.”',
        ],
        ['h2', 'The agent in the tab'],
        [
          'p',
          'Browser makers are building assistants that can read a page, fill a form and complete a task across multiple sites. The demos are impressive. The permission model is not yet. An agent that can act inside your logged-in sessions is effectively a new kind of privileged user.',
        ],
        ['p', 'The early implementations rely on user confirmation for sensitive actions, but the prompts are easy to train people to click through. Security researchers warn that the distinction between “read” and “act” is not always clear to the person granting access.'],
        ['quote', 'A browser tab used to be a document. Now it can be a delegate.'],
        ['h2', 'What comes next'],
        [
          'p',
          'The browser companies that win this next phase will be the ones that make delegation legible: clear scopes, visible activity, easy revocation and a record of what an agent did. That is less exciting than a demo, and more important than a feature list.',
        ],
      ]),
    },
    {
      title: 'Helio Watch S2 review: a focused fitness device, not a smartwatch',
      category: 'reviews',
      author: 'zain-abbas',
      image: 'signal-aperture',
      ago: 76,
      rating: 8.2,
      views: 6120,
      tags: ['Wearables', 'Fitness', 'Reviews'],
      sourceName: 'MIC TECH test bench',
      body: blocksFromRows([
        [
          'p',
          'The Helio Watch S2 is not trying to be a wrist computer. It tracks training, sleep and recovery, tells the time and then gets out of the way. After three weeks of use, that focus feels like a feature rather than a limitation.',
        ],
        ['h2', 'Training first'],
        [
          'p',
          'Heart-rate accuracy was close to a chest strap in steady efforts and drifted during short intervals, which is typical for optical sensors. GPS locking was quick and route tracking was reliable. The training-load suggestions are conservative but sensible.',
        ],
        ['p', 'The display is bright enough for outdoor use, the strap is comfortable and battery life landed at nine days with daily workouts. Sleep tracking matched our reference device more closely than expected.'],
        ['h2', 'What it lacks'],
        [
          'p',
          'There is no app store, no cellular option and no contactless payment. Notifications are limited to a handful of apps. If you want a wrist phone, this is not it. If you want a training tool, the omissions are easier to accept.',
        ],
        ['quote', 'The S2 is the rare wearable that feels designed for a body rather than a feed.'],
        ['p', 'At $249, it is a good value for runners and cyclists who want the essentials. Just do not buy it expecting a smartwatch.',
        ],
      ]),
    },
    {
      title: 'Warehouse robots are learning to ask for help',
      category: 'ai',
      author: 'daniyal-khan',
      image: 'signal-robot',
      ago: 80,
      views: 4890,
      tags: ['Robotics', 'AI', 'Logistics'],
      body: blocksFromRows([
        [
          'p',
          'The latest generation of warehouse robots is not being trained to do everything. It is being trained to notice when it is stuck. That sounds like a small advance. In a working warehouse, it is the difference between a useful machine and a expensive obstacle.',
        ],
        ['h2', 'The handoff problem'],
        [
          'p',
          'Automation works best when the environment is predictable. Real warehouses are not. A box is dented, a pallet is mislabeled, a human leaves a cart in the aisle. The robot’s ability to recognize the edge of its competence and request a human is more valuable than another degree of dexterity.',
        ],
        ['p', 'Several vendors are now selling systems that log uncertainty and route exceptions to a remote operator. The operator can guide the robot, label the failure and feed the result back into training. It is a practical hybrid of automation and human judgment.'],
        ['quote', 'The most important robot skill may be knowing when to stop.'],
        ['h2', 'The labor question'],
        [
          'p',
          'The systems are designed to reduce repetitive travel and lifting, not to eliminate the workforce. That is a more honest pitch than full automation, and a more achievable one. The risk is that the remaining jobs become monitoring work with little autonomy.',
        ],
        [
          'p',
          'Warehouses are becoming a test case for a broader pattern: automation that works best when it is allowed to ask for help. The companies that design that handoff well will get more from the machines.',
        ],
      ]),
    },
    {
      title: 'The next spectrum auction will be a test of patience',
      category: 'telecom',
      author: 'sana-iqbal',
      image: 'signal-telecom-spectrum',
      ago: 84,
      views: 3420,
      tags: ['Spectrum', 'Telecom policy', '5G'],
      body: blocksFromRows([
        [
          'p',
          'Spectrum auctions are supposed to be efficient markets. In practice, they are long negotiations dressed up as bidding events. The upcoming auction will test whether operators can agree on a set of rules before the first bid, or whether the process will drift into another round of litigation.',
        ],
        ['h2', 'The stakes'],
        [
          'p',
          'The band in question is valuable for dense urban coverage and industrial applications. How it is divided will shape network economics for a decade. Small operators argue that set-asides are needed to prevent the largest carriers from consolidating capacity. Incumbents argue that scale is necessary to justify the investment.',
        ],
        ['p', 'The regulator has proposed a cap on spectrum holdings, along with build-out obligations. The details matter: a cap that is too loose changes nothing, while one that is too tight can suppress investment.'],
        ['quote', 'Spectrum policy is industrial policy by another name.'],
        ['h2', 'The real timetable'],
        [
          'p',
          'Even a successful auction will not produce better service immediately. Equipment lead times, site approvals and backhaul upgrades all take time. The first visible improvements would arrive years after the gavel. That is the part of the story the headlines usually miss.',
        ],
      ]),
    },
    {
      title: 'Video: inside a chip packaging lab',
      category: 'technology',
      author: 'ayesha-rahman',
      image: 'signal-video-lab',
      ago: 88,
      videoUrl: '/videos/chip-packaging-lab.mp4',
      views: 10420,
      tags: ['Video', 'Semiconductors', 'Advanced packaging'],
      body: blocksFromRows([
        [
          'p',
          'In this MIC TECH visual report, we walk through the cleanroom steps that turn individual silicon dies into a finished accelerator package. The process is part manufacturing, part surgery and part logistics.',
        ],
        ['p', 'The video follows a package from wafer dicing through inspection and final test. It is a rare look at the layer of the supply chain that has become a bottleneck for AI hardware.'],
        ['h2', 'What to watch for'],
        [
          'p',
          'Notice the number of manual inspections. Automation is increasing, but experienced technicians still catch defects that machines miss. That human layer is one reason capacity cannot be expanded overnight.',
        ],
        ['p', 'The report was produced by the MIC TECH video desk. It is an explanatory visual essay, not a sponsored tour.'],
      ]),
    },
    {
      title: 'Video: the foldable buyer’s guide for 2026',
      category: 'mobile',
      author: 'omar-farooq',
      image: 'signal-video-device',
      ago: 92,
      videoUrl: '/videos/foldable-buyers-guide.mp4',
      views: 8940,
      tags: ['Video', 'Foldables', 'Buying guide'],
      body: blocksFromRows([
        [
          'p',
          'Foldables are finally mature enough to recommend without a paragraph of caveats. In this buyer’s guide, we compare the current generation on the things that matter after the first week: hinge feel, crease visibility, battery life, camera consistency and repair costs.',
        ],
        ['h2', 'The short version'],
        [
          'p',
          'If you want the largest inner screen, prioritize display quality and app continuity. If you want a phone that happens to fold, prioritize weight and cover-screen usability. If you keep devices for years, check parts pricing and warranty terms before you fall in love with the hardware.',
        ],
        ['p', 'Our full written reviews are linked below the video. Every device was tested by the MIC TECH device lab over at least seven days.'],
      ]),
    },
    {
      title: 'Video: rebuilding a city grid for electric transport',
      category: 'automobile',
      author: 'usman-tariq',
      image: 'signal-video-lab',
      ago: 96,
      videoUrl: '/videos/electric-city-grid.mp4',
      views: 7360,
      tags: ['Video', 'EV', 'Infrastructure'],
      body: blocksFromRows([
        [
          'p',
          'Electric vehicles get the attention. The harder work is happening in substations, depots and parking structures. This MIC TECH field report looks at how one city is preparing its grid for a future with more electric miles and fewer predictable peaks.',
        ],
        ['p', 'The report follows a fleet operator, a utility planner and a charging-network engineer through the same problem from three different angles. The solutions are not glamorous, but they are instructive.'],
        ['h2', 'The lesson'],
        [
          'p',
          'You cannot separate the vehicle transition from the electricity transition. The cities that plan both together will avoid the most expensive mistakes. The ones that treat charging as a real-estate problem will keep discovering the grid later.'],
      ]),
    },
    {
      title: 'The case for smaller models in public services',
      category: 'ai',
      author: 'daniyal-khan',
      image: 'signal-frontier-model',
      status: 'draft',
      tags: ['AI', 'Public sector', 'Draft'],
      aiAssisted: true,
      body: blocksFromRows([
        [
          'p',
          'Public services do not need the largest model. They need a system that is accurate, auditable and cheap enough to run at the scale of a queue. This draft explores where smaller, fine-tuned models are a better fit than a frontier API.',
        ],
        ['h2', 'Why smaller can be safer'],
        [
          'p',
          'A narrow model is easier to evaluate. Its failure modes are more legible, and its outputs can be checked against a defined policy. That is a better starting point for public accountability than a general-purpose assistant that can do anything and explain nothing.',
        ],
        ['p', 'The counterargument is capability. Some tasks require broad reasoning, and a small model may miss context that matters. The answer is not one model for everything. It is a portfolio approach with clear boundaries.'],
        ['h2', 'Open questions'],
        [
          'p', 'Draft note: verify procurement examples, add a section on data residency and interview two public-sector operators before publication.',
        ],
      ]),
    },
    {
      title: 'First look: the Vela Buds Pro',
      category: 'gadgets',
      author: 'omar-farooq',
      image: 'signal-review-audio',
      status: 'review',
      tags: ['Audio', 'Review', 'Vela'],
      body: blocksFromRows([
        [
          'p',
          'The Vela Buds Pro arrive with a new adaptive audio engine and a case that adds a small display. We have been testing them for four days. This is a working review, not a final verdict.',
        ],
        ['h2', 'Early impressions'],
        [
          'p',
          'Noise cancellation is strong on low-frequency noise and less effective on voices. The fit is comfortable, but the touch controls are too easy to trigger accidentally. Battery life is tracking close to the claimed eight hours.',
        ],
        ['p', 'The case display is more useful than expected for battery and pairing status. It is also one more screen to scratch. Full review and lab measurements will follow after a week of testing.'],
      ]),
    },
    {
      title: 'The next wave of fintech will be invisible',
      category: 'business',
      author: 'mira-sethi',
      image: 'signal-business-cycle',
      status: 'scheduled',
      future: 48,
      tags: ['Fintech', 'Payments', 'Business'],
      body: blocksFromRows([
        [
          'p',
          'The most successful financial technology of the next decade may not look like a fintech app at all. It will be embedded in payroll software, procurement tools, marketplaces and the back office of small businesses. The consumer-facing app was the first act.',
        ],
        ['h2', 'From destination to layer'],
        [
          'p',
          'The first generation of fintech asked customers to move their money to a new place. The next generation asks them to leave it where it is and let software handle the movement. That is a less visible product and a more durable business.',
        ],
        ['p', 'The model depends on trust and integration, not acquisition. It also invites competition from the software platforms that already own the workflow. The winners will be decided by distribution and reliability, not by a better onboarding screen.'],
        ['quote', 'The best payment is the one you never think about.'],
        ['h2', 'The regulatory bill'],
        [
          'p', 'Embedded finance spreads risk across more partners. Regulators will want clear responsibility when something goes wrong. The companies that treat compliance as a product feature will have an advantage over those that treat it as a cost center.',
        ],
      ]),
    },
  ];

  return seeds.map((seed) => makeArticle(now, seed));
}
