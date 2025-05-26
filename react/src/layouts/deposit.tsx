import { useEffect, useState } from "react";
const Deposit = () => {
    const [saldo, setSaldo] = useState('');
    

    useEffect(() => {
       fetch('https://api.mypulsa.my.id/fetch-data-saldo').then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
       }).then(result => {
          setSaldo(result.data.deposit);
       }).catch(err => {
          console.log(err);
       })
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