"use client"

import Link from "next/link"
import { Github, Twitter, MessageCircle, Zap, ArrowRight, Heart } from "lucide-react"

export function Footer() {
  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Github, href: "#", label: "GitHub" },
    { icon: MessageCircle, href: "#", label: "Discord" },
  ]

  return (
    <footer className="relative py-16 px-6">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-pink-50/50" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/25">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-foreground">CasperFlow</span>
                <span className="block text-[10px] text-pink-500 font-semibold tracking-wider">DEFI PROTOCOL</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Trade across chains while earning staking yield. The future of DeFi on Casper.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-white border border-pink-100 flex items-center justify-center text-pink-500 hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {[
            {
              title: "Product",
              links: [
                { name: "Trade", href: "/trade" },
                { name: "Stake", href: "/stake" },
                { name: "Vaults", href: "/vaults" },
                { name: "Intents", href: "/intents" },
              ],
            },
            {
              title: "Resources",
              links: [
                { name: "Documentation", href: "#" },
                { name: "API Reference", href: "#" },
                { name: "Whitepaper", href: "#" },
                { name: "Blog", href: "#" },
              ],
            },
            {
              title: "Company",
              links: [
                { name: "About", href: "#" },
                { name: "Careers", href: "#" },
                { name: "Support", href: "#" },
                { name: "Contact", href: "#" },
              ],
            },
          ].map((column) => (
            <div key={column.title}>
              <h4 className="font-bold text-foreground mb-4">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-muted-foreground hover:text-pink-500 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 md:p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white text-center md:text-left">
              <h3 className="text-xl font-bold mb-1">Ready to start trading?</h3>
              <p className="text-pink-100 text-sm">Join thousands of traders earning yield on their positions</p>
            </div>
            <Link href="/trade" className="px-6 py-3 bg-white text-pink-500 font-bold rounded-xl hover:bg-pink-50 transition-colors flex items-center gap-2 whitespace-nowrap">
              Launch App
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-pink-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm flex items-center gap-1">
              © 2025 CasperFlow. Built with
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500 mx-1" />
              for the Casper Hackathon.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-pink-500 transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-pink-500 transition-colors">Terms</Link>
              <Link href="#" className="hover:text-pink-500 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
