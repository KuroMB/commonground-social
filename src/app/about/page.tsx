import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="max-w-xl mx-auto px-4 py-16 space-y-10">

      <div className="space-y-2">
        <Link href="/" className="text-sm text-stone-400 hover:text-stone-600">
          ← CommonGround
        </Link>
        <h1 className="text-2xl font-semibold text-stone-900">About</h1>
      </div>

      <div className="space-y-4 text-stone-600 leading-relaxed">
        <p>
          I&apos;m just one person. CommonGround isn&apos;t backed by venture capital,
          it doesn&apos;t have a growth team, and there are no investors expecting a return.
          It&apos;s a project I&apos;m building because I think the infrastructure for
          neighbors to share things with each other doesn&apos;t exist yet — at least
          not without an algorithm and an ad budget attached to it.
        </p>
        <p>
          The goal is simple: your neighbor has a drill. You need a drill.
          That transaction shouldn&apos;t require a corporation in the middle
          taking a cut of your attention.
        </p>
      </div>

      <div className="space-y-4 text-stone-600 leading-relaxed">
        <h2 className="text-base font-semibold text-stone-900">On using AI</h2>
        <p>
          I&apos;m not uncritically pro-AI. I think a lot of what it&apos;s being used
          for right now is genuinely harmful — generating content no one asked for,
          replacing human judgment in places where that matters, and mostly making
          a few companies a lot of money.
        </p>
        <p>
          But I think it can also be used for good, and this is my attempt at that.
          Here&apos;s specifically what AI does on CommonGround:
        </p>
        <ul className="space-y-2 list-disc list-inside text-stone-500">
          <li>Suggests a task list when someone starts a community project — so the organizer doesn&apos;t start from a blank page</li>
          <li>Helps draft outreach letters and volunteer calls — first draft, always reviewed by a human</li>
          <li>Does preliminary research on things like property ownership or permit requirements — surfaces public information, doesn&apos;t make decisions</li>
        </ul>
        <p>
          The reason I&apos;m using it is cost. A small platform with no ads and no
          investors needs to stay lean. AI lets one person build and maintain
          something that would otherwise need a team — which means I don&apos;t
          have to monetize your data to pay for that team.
        </p>
        <p>
          That&apos;s the tradeoff I&apos;m making, and I think it&apos;s an honest one.
          If you disagree, the{" "}
          <a
            href="https://github.com/KuroMB/commonground-social"
            className="underline hover:text-stone-900"
            target="_blank"
            rel="noopener noreferrer"
          >
            source code is public
          </a>
          {" "}and you can see exactly what it&apos;s doing.
        </p>
      </div>

      <div className="space-y-4 text-stone-600 leading-relaxed">
        <h2 className="text-base font-semibold text-stone-900">What this is and isn&apos;t</h2>
        <ul className="space-y-2 list-disc list-inside text-stone-500">
          <li>No ads, ever — advertising requires selling your attention, which requires keeping you on the platform, which is the opposite of what this is for</li>
          <li>No algorithmic feed — what&apos;s near you, in order, that&apos;s it</li>
          <li>No selling your data — the business model is a small fee on funded community projects, not behavioral targeting</li>
          <li>No VC money — the incentive structures are incompatible with building something for communities</li>
          <li>AGPL licensed — the code is free, anyone can run their own instance, a community in another country can adapt it for themselves</li>
        </ul>
      </div>

      <div className="space-y-3 text-stone-600 leading-relaxed">
        <h2 className="text-base font-semibold text-stone-900">The bigger idea</h2>
        <p>
          Every time someone borrows instead of buys, something useful happens: fewer
          things get manufactured, fewer things sit unused, fewer things end up in landfills,
          and two neighbors who didn&apos;t know each other do. CommonGround is trying to make
          that easier — not as an environmental brand, but because it&apos;s genuinely
          better for everyone involved.
        </p>
        <p>
          If it works, I&apos;d like to eventually structure it as a nonprofit or cooperative.
          For now it&apos;s just me, trying to build the thing I wish existed.
        </p>
      </div>

      <div className="border-t border-stone-200 pt-8 space-y-2 text-sm text-stone-500">
        <p>Questions or feedback?</p>
        <p>Use the Support button in the lower right, or read the <Link href="/docs/philosophy" className="underline hover:text-stone-700">full philosophy</Link>.</p>
      </div>

    </main>
  );
}
