`timescale 1ns/1ps
module alu_4bit_tb;
reg [3:0] a,b; reg [2:0] op;
wire [3:0] result; wire carry,zero;
alu_4bit dut(a,b,op,result,carry,zero);
initial begin
  a=4'd5;b=4'd3;
  op=3'b000;#10;
  op=3'b001;#10;
  op=3'b010;#10;
  op=3'b011;#10;
  op=3'b100;#10;
  op=3'b101;#10;
  $finish;
end
endmodule
