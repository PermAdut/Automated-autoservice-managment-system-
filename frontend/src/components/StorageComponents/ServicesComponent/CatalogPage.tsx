import { PageLayout } from "../../layout/PageLayout";
import ServiceList from "./ServiceList/ServiceList";

export default function CatalogPage() {
  return (
    <PageLayout className="pb-16">
      <ServiceList />
    </PageLayout>
  );
}
