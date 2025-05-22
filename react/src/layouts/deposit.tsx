import { useEffect, useState } from "react";
const Deposit = () => {
    const [saldo, useSaldo] = useState('');

    useEffect(() => {
       fetch('http://api.mypulsa.my.id/fetch-data').then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
       }).then(data => {
           useSaldo(data);
       }).catch(err => {
          console.log(err);
       })
    },[])

    return(
        <>
          Saldo : Rp { saldo }
        </>
    );
}
export default Deposit