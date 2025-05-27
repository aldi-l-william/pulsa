import { useEffect, useState, useRef } from "react";
import api from "../services/api";
const DashboardTransaksi = () => {
    const [pricelist, setPriceList] = useState<[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [itemList, setItemList] = useState<any>(null);

    // Tambahkan state untuk nomor customer inputan
    const [customerNumberInput, setCustomerNumberInput] = useState("");

    const fetchedRef = useRef(false);

    const buyProduct = async() => {
        try {
            const res = await api.post('/buy-prepaid', { buyer_sku_code: itemList.buyer_sku_code,
                    customer_number: customerNumberInput });
            console.log(res, "res data");
            // Bisa reset nomor customer input setelah berhasil beli
            setCustomerNumberInput("");
            setShowDialog(false); // tutup dialog jika mau
        } catch (err:any) {
            console.error("Gagal:", err);
        }

    }

    useEffect(() => {
        if (fetchedRef.current) return; // cegah double fetch
        fetchedRef.current = true;
         const fetchSaldo = async () => {
            try {
                const res = await api.get('/fetch-data-price-list'); 
                setPriceList(res.data.data);
                setLoading(false);
            } catch (err: any) {
               setError(err.message);
               setLoading(false);
            }
        };
        fetchSaldo();
    }, [])

    return(
        <>
            <div className="p-4">
                {loading && <p>🔄 Memuat data...</p>}
                {error && <p className="text-red-500">❌ {error}</p>}

                {!loading && !error && pricelist.length === 0 && (
                    <p>📭 Tidak ada data yang tersedia.</p>
                )}

                {showDialog && (
                    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/30 z-50">
                        <div className="border border-black p-4 bg-white rounded shadow">
                            <div className="flex justify-between items-center">
                                <div>{itemList.brand}</div>
                                <div
                                    onClick={() => {
                                        setShowDialog(false);
                                        setCustomerNumberInput(""); // reset input saat tutup
                                    }}
                                    className="bg-gray-400 rounded-full px-3 py-1 cursor-pointer text-white">x</div>
                            </div>

                            <div>{itemList.product_name}</div>
                            <div>Rp. {itemList.price.toLocaleString()}</div>
                            <input
                                placeholder="Input Nomor Customer"
                                className="px-4 py-2 mb-4 border border-black w-full"
                                value={customerNumberInput} // controlled input
                                onChange={(e) => setCustomerNumberInput(e.target.value)} // update state
                            />
                            <button 
                                onClick={() => {
                                    buyProduct();
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer w-full">
                                Beli
                            </button>
                        </div>
                    </div>
                )}

                {!loading && !error && pricelist.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {pricelist.map((item: any) => (
                            <div key={item.buyer_sku_code} 
                                className="border p-4 rounded shadow cursor-pointer"
                                onClick={() => {
                                    setShowDialog(true);
                                    setItemList(item);
                                    setCustomerNumberInput(""); // reset input saat dialog baru dibuka
                                }}>
                                <p className="font-semibold">{item.brand}</p>
                                <p className="text-sm text-gray-500">{item.product_name}</p>
                                <p className="text-sm">Harga: Rp {item.price.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>  
        </>
    );
}
export default DashboardTransaksi
