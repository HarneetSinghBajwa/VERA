module register_4bit(
    input wire clk,
    input wire reset,
    input wire en,
    input wire [3:0] d,
    output reg [3:0] q
);
always @(posedge clk or posedge reset) begin
    if (reset)
        q <= 4'b0000;
    else if (en)
        q <= d;
end
endmodule
