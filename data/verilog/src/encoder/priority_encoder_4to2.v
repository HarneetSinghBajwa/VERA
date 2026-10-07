module priority_encoder_4to2(
    input wire [3:0] d,
    output reg [1:0] y,
    output reg valid
);
always @(*) begin
    valid = 1'b1;
    casex (d)
        4'b1xxx: y = 2'b11;
        4'b01xx: y = 2'b10;
        4'b001x: y = 2'b01;
        4'b0001: y = 2'b00;
        default: begin y = 2'b00; valid = 1'b0; end
    endcase
end
endmodule
