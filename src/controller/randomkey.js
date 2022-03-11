const randomData = [
   "0",
   "1",
   "2",
   "3",
   "4",
   "5",
   "6",
   "7",
   "8",
   "9",
   "A",
   "B",
   "C",
   "D",
   "E",
   "F",
   "G",
   "H",
   "I",
   "J",
   "K",
   "L",
   "M",
   "N",
   "O",
   "P",
   "Q",
   "R",
   "S",
   "T",
   "U",
   "V",
   "W",
   "X",
   "Y",
   "Z",
   "a",
   "b",
   "c",
   "d",
   "e",
   "f",
   "g",
   "h",
   "i",
   "j",
   "k",
   "l",
   "m",
   "n",
   "o",
   "p",
   "q",
   "r",
   "s",
   "t",
   "u",
   "v",
   "w",
   "x",
   "y",
   "z",
];

/** trả về chuỗi bất kỳ với độ dài đã chọn
 * @param {string} length 
 * chiều dài chuỗi
 * @returns str
 */
export default function randomkey(length = 20) {
   let str = "";
   for (let i = 0; i < length; i++) {
      let ran = Math.floor(Math.random() * randomData.length);
      str += randomData[ran];
   }
   return str;
}