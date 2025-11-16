import { cloudflare } from '@cloudflare/vite-plugin'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(() => {
	return {
		server: {
			port: 8789,
			host: '0.0.0.0',
		},
		plugins: [cloudflare(), react()],
	}
})
