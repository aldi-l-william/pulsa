import { useEffect, useState } from "react";
const Deposit = () => {
    const [saldo, useSaldo] = useState('');

    useEffect(() => {
       fetch('https://api.mypulsa.my.id/fetch-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              "cmd": "deposit",
              "username": "username",
              "sign": "740b00a1b8784e028cc8078edf66d12b"
          })
       }).then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
       }).then(data => {
           useSaldo(data);
       })
    },[])

    return(
        <>
          Saldo : Rp { saldo }
        </>
    );
}
export default Deposit