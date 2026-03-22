import ServiceList from "./ServicesComponent/ServiceList/ServiceList";
import StorageList from "./StoreComponent/StorageList/StorageList";
import { PageLayout } from "../layout/PageLayout";

const Storage = () => {
  return (
    <PageLayout className="pb-20 space-y-10">
      <StorageList />
      <ServiceList />
    </PageLayout>
  );
};

export default Storage;
