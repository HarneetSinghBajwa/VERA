`timescale 1ns/1ps
module full_adder_tb;
reg a,b,cin; wire sum,cout;
full_adder dut(a,b,cin,sum,cout);
integer i;
initial begin
  for(i=0;i<8;i=i+1) begin
    {a,b,cin}=i; #5;
    $display("a=%b b=%b cin=%b -> sum=%b cout=%b",a,b,cin,sum,cout);
  end
  $finish;
end
endmodule
