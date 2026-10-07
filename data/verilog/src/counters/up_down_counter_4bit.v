module up_down_counter_4bit(
    input wire clk,
    input wire reset,
    input wire up,
    output reg [3:0] q
);
always @(posedge clk or posedge reset) begin
    if (reset)
        q <= 4'b0000;
    else if (up)
        q <= q + 4'b0001;
    else
        q <= q - 4'b0001;
end
endmodule
