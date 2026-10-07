module mux_4to1_structural(
    input wire [3:0] d,
    input wire [1:0] sel,
    output wire y
);
wire y0, y1;
mux_2to1 m0(d[0], d[1], sel[0], y0);
mux_2to1 m1(d[2], d[3], sel[0], y1);
mux_2to1 m2(y0, y1, sel[1], y);
endmodule
