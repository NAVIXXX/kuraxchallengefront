import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
  return null;
}
