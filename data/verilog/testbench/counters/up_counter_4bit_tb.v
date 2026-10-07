`timescale 1ns/1ps
module up_counter_4bit_tb;
reg clk,reset; wire [3:0] q;
up_counter_4bit dut(clk,reset,q);
initial clk=0;
always #5 clk=~clk;
initial begin
  reset=1; #12; reset=0; #80; $finish;
end
endmodule
