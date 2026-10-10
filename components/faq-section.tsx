import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/lib/seo/faq";

export function FaqSection() {
  return (
    <section id="faq" className="border-t border-line bg-white px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Reference</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          How to calculate Barshik, tithi, and shraddha dates
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
          A Hindu death anniversary tithi calculator has to account for Adhik Maas, local sunrise,
          and Purnimanta versus Amanta month names. These notes describe what this tool does, and
          where a family priest may still differ.
        </p>
        <Accordion type="single" collapsible className="mt-6">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
