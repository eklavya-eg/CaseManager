"use client"

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import WaterfallChart, { WaterfallChartProps } from "@/components/WaterFallChart";

export default function Graph() {
    const searchParams = useSearchParams();
    const rowId = searchParams.get('rowId');
    const [data, setData] = useState<WaterfallChartProps['data'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!rowId) {
            setError("No row ID provided");
            setLoading(false);
            return;
        }

        try {
            const storageKey = `shap_data_${rowId}`;
            const storedData = sessionStorage.getItem(storageKey);

            if (storedData) {
                const parsedData = JSON.parse(storedData);
                setData(parsedData);
            } else {
                setError("No data found for this row");
            }
        } catch (err) {
            setError("Failed to load data");
            console.error("Error loading SHAP data:", err);
        } finally {
            setLoading(false);
        }
    }, [rowId]);

    if (loading) {
        return (
            <div className="p-6 lg:p-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-6 lg:p-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error || "No data available"}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            <WaterfallChart data={data} />
        </div>
    );
}