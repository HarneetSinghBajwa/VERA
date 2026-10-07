module shift_register_siso_4bit(
    input wire clk,
    input wire reset,
    input wire serial_in,
    output reg serial_out
);
reg [3:0] q;
always @(posedge clk or posedge reset) begin
    if (reset)
        q <= 4'b0000;
    else
        q <= {q[2:0], serial_in};
end
assign serial_out = q[3];
endmodule
