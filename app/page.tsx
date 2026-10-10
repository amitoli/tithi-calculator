import { CalculatorApp } from "@/components/calculator-app";
import { FaqSection } from "@/components/faq-section";
import { JsonLd } from "@/components/json-ld";

export default function Home() {
  return (
    <>
      <JsonLd />
      <CalculatorApp />
      <FaqSection />
    </>
  );
}
