//  k6 run K6simple.js
import http from "k6/http";
import { check } from "k6";
import { sleep } from "k6";

export const options = {
	vus: 400, // Number of virtual users
	duration: "15s", // Duration of the test
	thresholds: {
		http_req_duration: ["max<10000"], // Maximum request duration threshold
	},
};

export default function () {
	const res = http.get("http://127.0.0.1:5173");
	check(res, {
		"status was 200": (r) => r.status === 200,
	});
	sleep(1);
}

// ✓ status was 200

//      checks.........................: 100.00% 11203 out of 11203
//      data_received..................: 1.2 MB  57 kB/s
//      data_sent......................: 896 kB  43 kB/s
//      http_req_blocked...............: avg=1.69s   min=0s       med=1.67s  max=9.4s   p(90)=3.71s    p(95)=4s
//      http_req_connecting............: avg=1.68s   min=0s       med=1.66s  max=6.54s  p(90)=3.7s     p(95)=3.97s
//    ✗ http_req_duration..............: avg=3.59s   min=150.92ms med=3.87s  max=9.27s  p(90)=5.97s    p(95)=6.24s
//        { expected_response:true }...: avg=3.59s   min=150.92ms med=3.87s  max=9.27s  p(90)=5.97s    p(95)=6.24s
//      http_req_failed................: 0.00%   0 out of 11203
//      http_req_receiving.............: avg=1.02ms  min=0s       med=0s     max=2.75s  p(90)=0s       p(95)=999.5µs
//      http_req_sending...............: avg=68.82ms min=0s       med=9.99ms max=2.85s  p(90)=178.82ms p(95)=219.01ms
//      http_req_tls_handshaking.......: avg=0s      min=0s       med=0s     max=0s     p(90)=0s       p(95)=0s
//      http_req_waiting...............: avg=3.52s   min=5.99ms   med=3.86s  max=6.54s  p(90)=5.96s    p(95)=6.24s
//      http_reqs......................: 11203   [540.900083/s]
//      iteration_duration.............: avg=7.11s   min=2.21s    med=6.67s  max=15.09s p(90)=12.91s   p(95)=13.31s
//      iterations.....................: 11203   540.900083/s
//      vus............................: 1832    min=0              max=11982
//      vus_max........................: 62000   min=4662           max=62000
