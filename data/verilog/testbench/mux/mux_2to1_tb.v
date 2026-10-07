`timescale 1ns/1ps
module mux_2to1_tb;
reg a,b,sel; wire y;
mux_2to1 dut(a,b,sel,y);
initial begin
  a=0;b=1;sel=0; #10;
  sel=1; #10;
  a=1;b=0;sel=0; #10;
  sel=1; #10;
  $finish;
end
endmodule
