module up_counter_4bit(
    input wire clk,
    input wire reset,
    output reg [3:0] q
);
always @(posedge clk or posedge reset) begin
    if (reset)
        q <= 4'b0000;
    else
        q <= q + 4'b0001;
end
endmodule
