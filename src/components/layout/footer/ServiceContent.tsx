import { FC, JSX } from "react";
import { OptionDataTypes } from "@/types/types";
import { ThemeCustomizationTranslationNode } from "@/types/theme/theme-customization";
import { safeParse } from "@utils/helper";
import VectorIcon from "@components/common/icons/VectorIcon";
import TruckIcon from "@components/common/icons/TruckIcon";
import SofaIcon from "@components/common/icons/SofaIcon";
import AssuranceIcon from "@components/common/icons/AssuranceIcon";

export interface ServiceContentDataTypes {
  name?: string;
  serviceData: ThemeCustomizationTranslationNode[];
}

export interface ServiceContenRenderTypes {
  serviceList: {
    options: OptionDataTypes;
  };
}

const ServiceContent: FC<ServiceContentDataTypes> = ({ serviceData }) => {
  return (
    <div className="mx-auto my-16 mt-16 sm:mt-0 w-full lg:my-12 md:my-20 md:max-w-4xl px-4 py-8">
      {serviceData?.slice(0, 1)?.map((service, index: number) => {
        const options =
          typeof service.options === "string"
            ? safeParse(service.options)
            : service.options;

        return <ServiceCarouselRender key={index} serviceList={{ options }} />;
      })}
    </div>
  );
};

const iconMapping: Record<string, JSX.Element> = {
  "icon-truck": <VectorIcon />,
  "icon-product": <TruckIcon />,
  "icon-dollar-sign": <SofaIcon />,
  "icon-support": <AssuranceIcon />,
};

const ServiceCarouselRender: FC<ServiceContenRenderTypes> = ({
  serviceList,
}) => {
  const { options } = serviceList;
  const { services } = options;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
      {services?.map((list, index: number) => {
        const iconKey = list?.service_icon;

        return (
          <div
            key={index}
            className="flex flex-col items-center justify-center gap-2.5 text-center py-4 px-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full  text-white dark:text-neutral-900">
            {iconMapping[iconKey]}
            </div>
            <p className="max-w-[180px] text-center font-archivo text-xs font-medium text-neutral-600 dark:text-neutral-400 leading-snug">
              {list.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default ServiceContent;
