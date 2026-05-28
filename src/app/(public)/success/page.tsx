import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ClearCartButton } from "@components/checkout/success/EmptyCart";
import OrderDetail from "@components/cart/OrderDetail";
import CheckSign from "@components/common/icons/CheckSign";
import { ORDER_ID } from "@/utils/constants";

const SuccessPage = async () => {
  const orderId = (await cookies()).get(ORDER_ID)?.value;
  if (!orderId) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-450px)] items-center px-4">
      <div className="flex w-full flex-col items-center justify-center overflow-hidden mt-20 md:mt-50">
        <CheckSign className="h-28 w-28 sm:h-38 sm:w-38" />
        <OrderDetail orderId={orderId} />
        <ClearCartButton buttonName="Continue shopping" redirect="/" />
      </div>
    </div>
  );
};

export default SuccessPage;
