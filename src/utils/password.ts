import bcrypt from 'bcrypt';

export const comparePassword = async (plain:string, hash:string)=> await bcrypt.compare(plain , hash);
export const hashePassword = async (plain:string,salt:number=10) => await bcrypt.hash(plain , salt);