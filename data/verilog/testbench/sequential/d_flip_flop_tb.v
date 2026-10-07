`timescale 1ns/1ps
module d_flip_flop_tb;
reg clk,d; wire q;
d_flip_flop dut(clk,d,q);
initial clk=0;
always #5 clk=~clk;
initial begin
  d=0; #7; d=1; #10; d=0; #10; $finish;
end
endmodule
