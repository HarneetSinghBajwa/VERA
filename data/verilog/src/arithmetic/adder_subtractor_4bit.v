module adder_subtractor_4bit(
    input wire [3:0] a,
    input wire [3:0] b,
    input wire sub,
    output wire [3:0] result,
    output wire cout
);
wire [3:0] b_xor;
assign b_xor = b ^ {4{sub}};
ripple_carry_adder_4bit rca(a, b_xor, sub, result, cout);
endmodule
