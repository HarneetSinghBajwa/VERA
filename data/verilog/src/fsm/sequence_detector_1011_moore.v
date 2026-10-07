module sequence_detector_1011_moore(
    input wire clk,
    input wire reset,
    input wire x,
    output reg y
);
localparam S0 = 3'd0, S1 = 3'd1, S2 = 3'd2, S3 = 3'd3, S4 = 3'd4;
reg [2:0] state, next_state;

always @(posedge clk or posedge reset) begin
    if (reset) state <= S0;
    else state <= next_state;
end

always @(*) begin
    case (state)
        S0: next_state = x ? S1 : S0;
        S1: next_state = x ? S1 : S2;
        S2: next_state = x ? S3 : S0;
        S3: next_state = x ? S4 : S2;
        S4: next_state = x ? S1 : S2;
        default: next_state = S0;
    endcase
end

always @(*) begin
    y = (state == S4);
end
endmodule
