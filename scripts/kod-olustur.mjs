// Kodu sadece kendi bilgisayarınızda çalıştırın. Oluşturulan kodları GitHub'a koymayın.
import {randomInt} from 'node:crypto';
const codes=new Set();while(codes.size<100)codes.add(String(randomInt(0,100_000_000)).padStart(8,'0'));
console.log([...codes].join('\n'));
