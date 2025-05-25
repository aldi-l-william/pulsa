import { useEffect, useState } from "react";
const Deposit = () => {
    const [saldo, useSaldo] = useState('');

    useEffect(() => {
       fetch('https://api.mypulsa.my.id/fetch-data-saldo').then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
       }).then(result => {
           useSaldo(result.data.deposit);
       }).catch(err => {
          console.log(err);
       })
    },[])

    return(
        <>
        <div className="px-4">
            Saldo : Rp { saldo }
        </div> 
        </>
    );
}
export default Deposit