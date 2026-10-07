module decoder_3to8(
    input wire [2:0] a,
    input wire en,
    output reg [7:0] y
);
always @(*) begin
    y = 8'b0;
    if (en)
        y[a] = 1'b1;
end
endmodule
