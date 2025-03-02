# **!ReBang**

[![Live Site](https://img.shields.io/badge/Live_Site-!ReBang-blue?style=for-the-badge&logo=googlechrome&logoColor=white)](https://rebang.online)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](https://makeapullrequest.com)

## [Rebang.Online](https://rebang.online)

An enhanced, feature-rich fork of [unduck](https://github.com/t3dotgg/unduck) that makes DuckDuckGo's bang redirects lightning fast while adding powerful new features and a modern interface.

## 🔥 NEW: Create Your Own Custom Bangs! 🔥

**!ReBang** now lets you **create and manage your own custom bang shortcuts**! Tired of waiting for DuckDuckGo to add your favorite site? Take control and create your own bangs in seconds:

* **Create unlimited custom bangs** that work exactly like official ones
* **Override existing bangs** with your preferred destinations
* **Simple interface** to add, edit, and manage your custom collection
* **Persistent storage** keeps your bangs available across sessions
* **Seamless integration** with the existing bang system

## Modern, Intuitive Interface

**!ReBang** features a clean, modern UI that makes searching with bangs more enjoyable:

![ReBang Interface Screenshot](public/screenshot.png)

* Sleek, responsive design that works on all devices
* Dark mode default
* Visual feedback during searches
* Easy access to **Custom Bangs** management


## Intelligent Search with Bang Discovery

The search bar on the **!ReBang** home page does more than just accept queries:

* **Bang autocomplete** - Discover new bangs as you type with intelligent suggestions
* **Visual indicators** - See which bangs are available for your current query
* **Instant feedback** - Know exactly where you'll be redirected before pressing Enter
* **Custom bang integration** - Your custom bangs appear alongside official bangs in search results


## Expanded Bang Collection

**!ReBang** goes beyond DuckDuckGo's bang collection:

* **Create your own bangs** - Add shortcuts to any website you frequently use
* **AI-focused bangs** - Quickly access ChatGPT (`!chat`), Claude (`!claude`), Perplexity (`!perp`), and other AI assistants
* **Curated collection** - Our bang list is regularly audited to remove dead links that DuckDuckGo hasn't maintained
* **Community suggestions** - New bangs are added based on user requests and usage patterns

## How to Use

1. **As a Custom Search Engine:**
   - Go to https://rebang.online/ to configure **!ReBang** to your preferences. (Default Search)
   - Add the URL `https://rebang.online/?q=%s` to your browser's custom search engines
   - Set **!ReBang** as your default search engine.
   - Type your search, include a bang `!g` `!yt` `!w` somewhere in the search, and **!ReBang** will reroute your request to where you want to search.
   - **Create custom bangs** by clicking the "My Bangs" button on the homepage!

2. **Direct Use:** 
   - Visit the website directly https://rebang.online/
   - Use the search bar to enter your bang commands
   - Get redirected instantly to your destination
   - Access your **Custom Bangs** manager from the homepage

## How to Create Custom Bangs

Creating your own bangs is simple:

1. Click the **"My Bangs"** button on the homepage
2. Click **"Add Custom Bang"** in the manager
3. Enter your bang's:
   - **Trigger** (e.g., `maps` for `!maps`)
   - **Service Name** (e.g., "Google Maps")
   - **URL Pattern** (e.g., `https://www.google.com/maps/search/{{{s}}}`)
4. Click **Save** and start using your custom bang immediately!

Your custom bangs work just like official ones and will override any official bangs with the same trigger.

## How **!ReBang** Improves on DuckDuckGo and unduck

| Feature | DuckDuckGo | unduck | **!ReBang** |
|---------|------------|--------|---------|
| Fast Redirects | ❌ (Server-side) | ✅ (Client-side) | ✅ (Client-side) |
| Modern UI | ✅ | ❌ | ✅ |
| Bang Autocomplete | ✅ | ❌ | ✅ |
| **Custom Bangs** | ❌ | ❌ | ✅ |
| AI-focused Bangs | ❌ | T3 Only | ✅ |
| Maintained Bang List | Partially | ❌ | ✅ |

## Why **!ReBang**?

* **Customization**: Create your own personal collection of bangs for sites you use most
* **Speed**: Redirects happen instantly on your device without server latency
* **Discovery**: Find useful new bangs you never knew existed
* **Reliability**: Dead links are regularly pruned from our bang collection
* **Privacy**: Your searches stay on your device - we don't track anything
* **Modern**: Sleek and Simple.
* **Community-driven**: Actively maintained and improved based on user feedback