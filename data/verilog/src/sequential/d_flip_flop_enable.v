module d_flip_flop_enable(
    input wire clk,
    input wire en,
    input wire d,
    output reg q
);
always @(posedge clk) begin
    if (en)
        q <= d;
end
endmodule
