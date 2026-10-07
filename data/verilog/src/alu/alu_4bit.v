module alu_4bit(
    input wire [3:0] a,
    input wire [3:0] b,
    input wire [2:0] op,
    output reg [3:0] result,
    output reg carry,
    output wire zero
);
always @(*) begin
    result = 4'b0000;
    carry = 1'b0;
    case (op)
        3'b000: {carry, result} = a + b;
        3'b001: {carry, result} = a - b;
        3'b010: result = a & b;
        3'b011: result = a | b;
        3'b100: result = a ^ b;
        3'b101: result = ~a;
        default: result = 4'b0000;
    endcase
end
assign zero = (result == 4'b0000);
endmodule
