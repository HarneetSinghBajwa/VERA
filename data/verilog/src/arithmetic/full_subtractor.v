module full_subtractor(
    input wire a,
    input wire b,
    input wire bin,
    output wire diff,
    output wire bout
);
assign diff = a ^ b ^ bin;
assign bout = ((~a) & b) | (bin & ~(a ^ b));
endmodule
