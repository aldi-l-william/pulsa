import { useEffect, useState } from "react";
import api from "../services/api";
const Deposit = () => {
    const [saldo, setSaldo] = useState('');
    

    useEffect(() => {
        const fetchSaldo = async () => {
            try {
                const res = await api.get('/protected/fetch-data-saldo'); 
                setSaldo(res.data.deposit);
            } catch (err: any) {
                alert('Gagal ambil saldo: ' + err.response?.data?.error);
            }
        };

        fetchSaldo();
    },[saldo])

    return(
        <>
        <div className="px-4">
            Saldo : Rp { saldo }
        </div> 
        </>
    );
}
export default Deposit