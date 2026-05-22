"use client";
import { useState } from "react";
import { ArrowLeftIcon, CreditCardIcon, ShoppingBagIcon, PrinterIcon } from "@heroicons/react/24/outline";
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
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-semibold hover:opacity-90 transition-opacity cursor-pointer"
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
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2.5 rounded-xl cursor-pointer border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
                        title="Back to Orders"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            Order #{order.incrementId}
                        </h2>
                    </div>
                </div>
                <div className="flex items-center gap-4 print:hidden">
                    <button className="px-6 py-2 border border-neutral-900 dark:border-white rounded-full text-sm font-medium hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 transition-all">
                        Cancel Order
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center border-b border-neutral-100 dark:border-neutral-800 mb-8 bg-neutral-50/50 dark:bg-neutral-900/-50 rounded-t-xl px-2 print:hidden">
                <button
                    onClick={() => setActiveTab("information")}
                    className={`px-8 py-4 cursor-pointer text-sm font-bold transition-all relative ${activeTab === "information"
                        ? "text-neutral-900 dark:text-white"
                        : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                        }`}
                >
                    Information
                    {activeTab === "information" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("invoices")}
                    className={`px-8 py-4 cursor-pointer text-sm font-bold transition-all relative ${activeTab === "invoices"
                        ? "text-neutral-900 dark:text-white"
                        : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                        }`}
                >
                    Invoices
                    {activeTab === "invoices" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white" />
                    )}
                </button>
            </div>

            {/* Tab Content */}
            {/* Tab Content Header */}
            <div className="mb-6">
                {activeTab === "information" ? (
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                            Placed on: {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                ) : invoicesLoading ? (
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
                {/* Consistent Order Content (Table and Totals) */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden mb-8 print:border-neutral-100 print:rounded-none">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50 dark:bg-neutral-800/50 print:bg-neutral-100">
                                <th className="px-6 py-4 text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">SKU</th>
                                <th className="px-6 py-4 text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-center">Qty</th>
                                <th className="px-6 py-4 text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {order.items?.edges?.map((edge: any) => {
                                const item = edge.node;
                                return (
                                    <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                        <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">{item.sku}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white">{item.name}</td>
                                        <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">${parseFloat(item.price).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 text-center">{item.qtyOrdered}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-neutral-900 dark:text-white text-right">${parseFloat(item.total).toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end mb-12 totals-container">
                    <div className="w-full max-w-xs space-y-3 totals-box">
                        <div className="flex justify-between items-center text-sm total-row">
                            <span className="text-neutral-500 dark:text-neutral-400">Subtotal</span>
                            <span className="font-semibold text-neutral-900 dark:text-white">${parseFloat(order.subTotal).toFixed(2)}</span>
                        </div>
                        {order.shippingAmount && (
                            <div className="flex justify-between items-center text-sm total-row">
                                <span className="text-neutral-500 dark:text-neutral-400">Shipping & Handling</span>
                                <span className="font-semibold text-neutral-900 dark:text-white">${parseFloat(order.shippingAmount).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-3 border-t border-neutral-100 dark:border-neutral-800 grand-total">
                            <span className="text-base font-bold text-neutral-900 dark:text-white uppercase">Grand Total</span>
                            <span className="text-xl font-bold text-neutral-900 dark:text-white">${parseFloat(order.grandTotal).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Common Address/Method Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 pt-8 border-t border-neutral-100 dark:border-neutral-800 print-grid print-pt-0">
                    <div>
                        <h3 className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-6">Billing Address</h3>
                        {billingAddress ? (
                            <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                                <p className="font-bold text-neutral-900 dark:text-white text-base mb-1">{billingAddress.companyName}</p>
                                <p className="font-bold text-neutral-900 dark:text-white">{billingAddress.firstName} {billingAddress.lastName}</p>
                                <p>{billingAddress.address}</p>
                                <p>{billingAddress.city}</p>
                                <p>{billingAddress.state}</p>
                                <p>{billingAddress.country} ({billingAddress.postcode})</p>
                                <p className="mt-4 pt-4 border-t border-neutral-50 dark:border-neutral-800/50">Contact : {billingAddress.phone}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-neutral-400 italic">No billing address</p>
                        )}
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-6">Shipping Address</h3>
                        {shippingAddress ? (
                            <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                                <p className="font-bold text-neutral-900 dark:text-white text-base mb-1">{shippingAddress.companyName}</p>
                                <p className="font-bold text-neutral-900 dark:text-white">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                                <p>{shippingAddress.address}</p>
                                <p>{shippingAddress.city}</p>
                                <p>{shippingAddress.state}</p>
                                <p>{shippingAddress.country} ({shippingAddress.postcode})</p>
                                <p className="mt-4 pt-4 border-t border-neutral-50 dark:border-neutral-800/50">Contact : {shippingAddress.phone}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-neutral-400 italic">No shipping address</p>
                        )}
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-6">Shipping Method</h3>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {order.shippingTitle || 'N/A'}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-6">Payment Method</h3>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {order.payment?.methodTitle || 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

