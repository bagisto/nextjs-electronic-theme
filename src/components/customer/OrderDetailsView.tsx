"use client";
import { useState } from "react";
import {
    ArrowLeftIcon,
    CreditCardIcon,
    ShoppingBagIcon,
    PrinterIcon,
    CalendarDaysIcon,
    TrashIcon,
    UserIcon,
    DocumentTextIcon,
    TruckIcon,
    ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useOrders } from "@/hooks/useOrders";
import OrderDetailsSkeleton, { OrderDetailInvoicesSkeleton } from "../common/skeleton/OrderDetailsSkeleton";

interface OrderDetailsViewProps {
    orderId: string;
    onBack: () => void;
}

export default function OrderDetailsView({ orderId, onBack }: OrderDetailsViewProps) {
    const [activeTab, setActiveTab] = useState<"information" | "invoices">("information");
    const { useGetOrderDetails, useGetOrderInvoices } = useOrders();
    const handlePrint = () => {
        window.print();
    };

    const { data: orderData, loading } = useGetOrderDetails(orderId);

    const { data: invoicesData, loading: invoicesLoading } = useGetOrderInvoices(orderId, activeTab === "invoices");
    const order = orderData?.customerOrder;

    const getStatusColor = (status: string) => {
        const s = (status || "").toLowerCase();
        if (["completed", "complete", "processing", "paid"].includes(s)) return "bg-green-500";
        if (["pending", "pending_payment", "on_hold"].includes(s)) return "bg-amber-500";
        if (["canceled", "cancelled", "closed", "fraud"].includes(s)) return "bg-red-500";
        return "bg-neutral-400";
    };

    if (loading) {
        return <OrderDetailsSkeleton />;
    }

    if (!order) {
        return (
            <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <ShoppingBagIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Order Not Found</h3>
                <p className="text-neutral-500 dark:text-neutral-400 mb-6">We couldn&apos;t retrieve the details for this order.</p>
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors cursor-pointer"
                >
                    <ArrowLeftIcon className="w-4 h-4" /> Back to Orders
                </button>
            </div>
        );
    }

    const addresses = order.addresses?.edges || [];
    const shippingAddress = addresses.find((edge: any) => edge.node.addressType === "order_shipping")?.node;
    const billingAddress = addresses.find((edge: any) => edge.node.addressType === "order_billing")?.node;

    return (
        <div className="order-details-view animate-in fade-in slide-in-from-bottom-4 duration-500">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body > * {
                        visibility: hidden;
                    }
                    #printable-area, #printable-area * {
                        visibility: visible;
                    }
                    #printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .print-grid {
                        display: grid !important;
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 20px !important;
                    }
                    .print-pt-0 {
                        padding-top: 0 !important;
                    }
                    /* Ensure table backgrounds are printed */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            ` }} />
            {/* Header section with back button and order ID */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
                <div className="flex items-start gap-4">
                    <button
                        onClick={onBack}
                        className="p-2.5 rounded-xl cursor-pointer border border-neutral-200 dark:border-neutral-800 hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors shadow-sm"
                        title="Back to Orders"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                Order #{order.incrementId}
                            </h2>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold capitalize">
                                <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(order.status)}`} />
                                {order.status}
                            </span>
                        </div>
                        <p className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 mt-1.5">
                            <CalendarDaysIcon className="w-4 h-4" />
                            Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} at {new Date(order.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 print:hidden">
                    <button className="inline-flex items-center gap-2 px-5 py-2 border border-red-300 dark:border-red-900/60 text-red-600 dark:text-red-400 rounded-full text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer">
                        Cancel Order
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-8 border-b border-neutral-100 dark:border-neutral-800 mb-8 print:hidden">
                <button
                    onClick={() => setActiveTab("information")}
                    className={`flex items-center gap-2 py-4 -mb-px border-b-2 cursor-pointer text-sm font-bold transition-all ${activeTab === "information"
                        ? "text-green-600 dark:text-green-400 border-green-500"
                        : "text-neutral-400 border-transparent hover:text-neutral-600 dark:hover:text-neutral-300"
                        }`}
                >
                    <UserIcon className="w-4 h-4" />
                    Information
                </button>
                <button
                    onClick={() => setActiveTab("invoices")}
                    className={`flex items-center gap-2 py-4 -mb-px border-b-2 cursor-pointer text-sm font-bold transition-all ${activeTab === "invoices"
                        ? "text-green-600 dark:text-green-400 border-green-500"
                        : "text-neutral-400 border-transparent hover:text-neutral-600 dark:hover:text-neutral-300"
                        }`}
                >
                    <DocumentTextIcon className="w-4 h-4" />
                    Invoices
                </button>
            </div>

            {/* Tab Content */}
            {/* Tab Content Header */}
            <div className={activeTab === "invoices" ? "mb-6" : ""}>
                {activeTab === "information" ? null : invoicesLoading ? (
                    <OrderDetailInvoicesSkeleton />
                ) : (
                    <div className="space-y-4">
                        {invoicesData?.customerInvoices?.edges && invoicesData.customerInvoices.edges.length > 0 ? (
                            invoicesData.customerInvoices.edges.map((edge: any) => {
                                const invoice = edge.node;
                                return (
                                    <div key={invoice.id} className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 last:border-0 last:pb-0">
                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Invoice #{invoice.incrementId}</h3>
                                        <button
                                            onClick={handlePrint}
                                            className="flex items-center gap-2 cursor-pointer px-4 py-2 text-sm font-bold text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-800"
                                        >
                                            <PrinterIcon className="w-4 h-4" />
                                            Print
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                                <CreditCardIcon className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                                <h3 className="text-lg font-bold">No Invoices</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">No invoices have been generated for this order yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div id="printable-area">
                {/* Order Items */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden mb-8 print:border-neutral-100 print:rounded-none">
                    <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Order Items</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[560px]">
                            <thead>
                                <tr className="text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 border-b border-neutral-100 dark:border-neutral-800">
                                    <th className="px-5 sm:px-6 py-3 font-semibold">Product</th>
                                    <th className="px-3 py-3 font-semibold">Price</th>
                                    <th className="px-3 py-3 font-semibold text-center">Qty</th>
                                    <th className="px-5 sm:px-6 py-3 font-semibold text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {order.items?.edges?.map((edge: any) => {
                                    const item = edge.node;
                                    return (
                                        <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                            <td className="px-5 sm:px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex shrink-0 items-center justify-center w-11 h-11 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 text-neutral-400">
                                                        <ShoppingBagIcon className="w-5 h-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">{item.name}</p>
                                                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">SKU: {item.sku}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">${parseFloat(item.price).toFixed(2)}</td>
                                            <td className="px-3 py-4 text-sm text-neutral-600 dark:text-neutral-400 text-center">{item.qtyOrdered}</td>
                                            <td className="px-5 sm:px-6 py-4 text-sm font-bold text-green-600 dark:text-green-400 text-right whitespace-nowrap">${parseFloat(item.total).toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="border-t border-neutral-100 dark:border-neutral-800 px-5 sm:px-6 py-5">
                        <div className="ml-auto w-full sm:max-w-sm space-y-3 totals-box">
                            <div className="flex justify-between items-center text-sm total-row">
                                <span className="text-neutral-500 dark:text-neutral-400">Subtotal</span>
                                <span className="font-semibold text-neutral-900 dark:text-white">${parseFloat(order.subTotal).toFixed(2)}</span>
                            </div>
                            {order.shippingAmount && (
                                <div className="flex justify-between items-center text-sm total-row">
                                    <span className="text-neutral-500 dark:text-neutral-400">Shipping &amp; Handling</span>
                                    <span className="font-semibold text-neutral-900 dark:text-white">${parseFloat(order.shippingAmount).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center rounded-xl bg-green-50 dark:bg-green-900/20 px-4 py-3 grand-total">
                                <span className="text-base font-bold text-neutral-900 dark:text-white">Grand Total</span>
                                <span className="text-xl font-bold text-green-600 dark:text-green-400">${parseFloat(order.grandTotal).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Common Address/Method Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-12 pt-8 border-t border-neutral-100 dark:border-neutral-800 print-grid print-pt-0">
                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                <UserIcon className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Billing Address</h3>
                        </div>
                        {billingAddress ? (
                            <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                                <p className="font-bold text-neutral-900 dark:text-white text-base mb-1">{billingAddress.companyName}</p>
                                <p className="font-bold text-neutral-900 dark:text-white">{billingAddress.firstName} {billingAddress.lastName}</p>
                                <p>{billingAddress.address}</p>
                                <p>{billingAddress.city}</p>
                                <p>{billingAddress.state}</p>
                                <p>{billingAddress.country} ({billingAddress.postcode})</p>
                                <p className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/50">Contact : <span className="text-green-600 dark:text-green-400">{billingAddress.phone}</span></p>
                            </div>
                        ) : (
                            <p className="text-sm text-neutral-400 italic">No billing address</p>
                        )}
                    </div>

                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                <UserIcon className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Shipping Address</h3>
                        </div>
                        {shippingAddress ? (
                            <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                                <p className="font-bold text-neutral-900 dark:text-white text-base mb-1">{shippingAddress.companyName}</p>
                                <p className="font-bold text-neutral-900 dark:text-white">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                                <p>{shippingAddress.address}</p>
                                <p>{shippingAddress.city}</p>
                                <p>{shippingAddress.state}</p>
                                <p>{shippingAddress.country} ({shippingAddress.postcode})</p>
                                <p className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/50">Contact : <span className="text-green-600 dark:text-green-400">{shippingAddress.phone}</span></p>
                            </div>
                        ) : (
                            <p className="text-sm text-neutral-400 italic">No shipping address</p>
                        )}
                    </div>

                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                <TruckIcon className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Shipping Method</h3>
                        </div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {order.shippingTitle || 'N/A'}
                        </p>
                        {order.shippingTitle && (
                            <span className="inline-block mt-3 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold">
                                Standard Delivery
                            </span>
                        )}
                    </div>

                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                <CreditCardIcon className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Payment Method</h3>
                        </div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {order.payment?.methodTitle || 'N/A'}
                        </p>
                        <div className="flex items-start gap-2 mt-3 rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
                            <ShieldCheckIcon className="w-4 h-4 shrink-0 text-green-600 dark:text-green-400 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-neutral-900 dark:text-white">Secure Payment</p>
                                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Your payment is safe and encrypted</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

