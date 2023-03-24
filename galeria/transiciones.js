let num1 = parseFloat(prompt("Ingrese el primer número: "));
let num2 = parseFloat(prompt("Ingrese el segundo número: "));
let operacion = prompt("Ingrese la operación a realizar (+, -, *, /): ");

let resultado;

switch(operacion) {
  case "+":
    resultado = num1 + num2;
    break;
  case "-":
    resultado = num1 - num2;
    break;
  case "*":
    resultado = num1 * num2;
    break;
  case "/":
    resultado = num1 / num2;
    break;
  default:
    console.log("Operación inválida");
}

console.log(`El resultado de la operación es: ${resultado}`);
