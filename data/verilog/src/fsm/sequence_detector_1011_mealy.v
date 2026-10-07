module sequence_detector_1011_mealy(
    input wire clk,
    input wire reset,
    input wire x,
    output reg y
);
localparam S0 = 2'd0, S1 = 2'd1, S2 = 2'd2, S3 = 2'd3;
reg [1:0] state, next_state;

always @(posedge clk or posedge reset) begin
    if (reset) state <= S0;
    else state <= next_state;
end

always @(*) begin
    y = 1'b0;
    case (state)
        S0: next_state = x ? S1 : S0;
        S1: next_state = x ? S1 : S2;
        S2: next_state = x ? S3 : S0;
        S3: begin
            if (x) begin
                next_state = S1;
                y = 1'b1;
            end else begin
                next_state = S2;
            end
        end
        default: next_state = S0;
    endcase
end
endmodule
