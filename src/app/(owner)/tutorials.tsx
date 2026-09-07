import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Linking, 
  TextInput,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface TutorialStep {
  title: string;
  desc: string;
}

interface TutorialGuide {
  id: string;
  category: string;
  title: string;
  duration: string;
  icon: string;
  color: string;
  steps: TutorialStep[];
}

export default function TutorialsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('guide_1');

  const guides: TutorialGuide[] = [
    {
      id: 'guide_1',
      category: 'Customer Setup',
      title: 'How to Onboard Customers & Set Jar Prices',
      duration: '2 mins',
      icon: 'people',
      color: '#0284C7',
      steps: [
        { title: '1. Open Customers Screen', desc: 'Tap on Customers from the Home Menu or bottom tab bar.' },
        { title: '2. Tap "+ Add Customer"', desc: 'Enter customer name, mobile number, and delivery street address.' },
        { title: '3. Set Custom Price & Empty Jars', desc: 'Set rate per 20L jar (e.g. ₹35) and initial empty jars given as deposit.' },
        { title: '4. Save & Share', desc: 'Customer is instantly registered and receives welcome WhatsApp notification.' }
      ]
    },
    {
      id: 'guide_2',
      category: 'Logistics',
      title: 'How to Dispatch & Balance Load/Unload Inventory',
      duration: '3 mins',
      icon: 'bus',
      color: '#EA580C',
      steps: [
        { title: '1. Open Load / Unload Screen', desc: 'Select Load / Unload from the owner dashboard grid.' },
        { title: '2. Choose Delivery Tempo & Driver', desc: 'Select which vehicle and driver is taking the delivery run.' },
        { title: '3. Enter Filled Jars Loaded', desc: 'Input quantity (e.g. 50 jars) to automatically deduct from plant stock.' },
        { title: '4. Record Returned Empties on Return', desc: 'When tempo returns, record empty jars to replenish washing inventory.' }
      ]
    },
    {
      id: 'guide_3',
      category: 'Billing',
      title: 'How to Collect Dues & Send WhatsApp Invoices',
      duration: '2 mins',
      icon: 'receipt',
      color: '#059669',
      steps: [
        { title: '1. Navigate to Billing', desc: 'Open Billing from the dashboard to see all pending customer balances.' },
        { title: '2. 1-Tap Send Invoice', desc: 'Tap "Send Invoice" to send an official bill slip directly to customer WhatsApp.' },
        { title: '3. Record Payment', desc: 'Tap "Collect Pay", select mode (Cash / UPI / Bank), and update the live ledger.' }
      ]
    },
    {
      id: 'guide_4',
      category: 'Digital Cards',
      title: 'How to Issue & Punch Digital Monthly Cards',
      duration: '2 mins',
      icon: 'calendar',
      color: '#0D9488',
      steps: [
        { title: '1. Open Monthly Cards Screen', desc: 'Tap Monthly Cards in the owner dashboard.' },
        { title: '2. Tap "+ Issue Monthly Card"', desc: 'Select customer, card month, and fixed daily jar quota.' },
        { title: '3. Punch Daily Deliveries', desc: 'Tap any day number (1-31) to toggle delivered jar count.' },
        { title: '4. Share 31-Day Statement', desc: 'Send full month visual punch card slip to customer on WhatsApp.' }
      ]
    },
    {
      id: 'guide_5',
      category: 'Financials',
      title: 'How to Record Operating Expenses & Track P&L',
      duration: '2 mins',
      icon: 'cash',
      color: '#E11D48',
      steps: [
        { title: '1. Open Payment & Expense Entry', desc: 'Select Payment Entry from the dashboard menu.' },
        { title: '2. Select Category', desc: 'Pick Fuel, Electricity, RO Filters, Staff Wages, or Counter Cash Sales.' },
        { title: '3. Save Entry', desc: 'Instantly reflects in Reports P&L and financial transaction passbook.' }
      ]
    },
    {
      id: 'guide_6',
      category: 'Staff & Security',
      title: 'How to Add Drivers & Generate Auth PINs',
      duration: '2 mins',
      icon: 'key',
      color: '#D97706',
      steps: [
        { title: '1. Open Staff Management', desc: 'Tap Staff from the menu and add driver name and phone.' },
        { title: '2. Generate Quick Auth PIN', desc: 'Use ☰ Drawer -> "Generate Driver Auth PIN" to give 4-digit code.' },
        { title: '3. Driver App Access', desc: 'Driver logs in instantly without needing email/password configuration.' }
      ]
    }
  ];

  const filteredGuides = guides.filter(g => 
    !searchQuery.trim() || 
    g.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    g.category.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* 1. TOP HELPLINE CONTACT BANNER */}
      <View className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 px-3.5 pt-2.5 pb-3">
        <View 
          className="rounded-2xl overflow-hidden shadow-sm shadow-sky-600/20 mb-2.5"
          style={{ elevation: 3 }}
        >
          <LinearGradient
            colors={['#0284C7', '#0EA5E9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="p-3.5 flex-row justify-between items-center"
          >
            <View className="flex-1 pr-2">
              <Text className="text-[10.5px] font-black text-sky-100 uppercase tracking-widest">
                NextWater 24x7 Help Desk
              </Text>
              <Text className="text-base font-black text-white mt-0.5">
                Call Helpline: 8485877633
              </Text>
              <Text className="text-xs text-sky-100 font-medium mt-0.5">
                Dedicated support for plant operations & setup
              </Text>
            </View>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => Linking.openURL('tel:8485877633').catch(() => {})}
                className="w-10 h-10 rounded-xl bg-white items-center justify-center shadow-sm"
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={18} color="#0284C7" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Linking.openURL('https://wa.me/918485877633?text=Hello%20NextWater%20Support,%20I%20need%20assistance%20with%20my%20water%20plant.').catch(() => {})}
                className="w-10 h-10 rounded-xl bg-emerald-500 items-center justify-center shadow-sm"
                activeOpacity={0.8}
              >
                <Ionicons name="logo-whatsapp" size={19} color="#FFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-2 border border-slate-200/60 dark:border-slate-800">
          <Ionicons name="search-outline" size={16} color="#94A3B8" />
          <TextInput
            placeholder="Search tutorials, operations guides & FAQs..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-xs font-medium text-slate-800 dark:text-slate-100 ml-2.5 py-0"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={15} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 2. GUIDES ACCORDION LIST */}
      <ScrollView
        className="flex-1 px-3.5 py-3"
        contentContainerStyle={{ paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5">
          Step-by-Step Interactive Guides ({filteredGuides.length})
        </Text>

        <View className="gap-3">
          {filteredGuides.map((guide) => {
            const isExpanded = expandedId === guide.id;

            return (
              <View
                key={guide.id}
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm"
              >
                {/* Accordion Trigger Header */}
                <TouchableOpacity
                  onPress={() => setExpandedId(isExpanded ? null : guide.id)}
                  className="flex-row justify-between items-center"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center flex-1 pr-2">
                    <View 
                      style={{ backgroundColor: `${guide.color}18` }} 
                      className="w-10 h-10 rounded-2xl items-center justify-center mr-2.5"
                    >
                      <Ionicons name={guide.icon as any} size={20} color={guide.color} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-[9.5px] font-black uppercase text-slate-400">
                          {guide.category}
                        </Text>
                        <Text className="text-slate-300">•</Text>
                        <Text className="text-[9.5px] font-bold text-sky-600">
                          {guide.duration}
                        </Text>
                      </View>
                      <Text className="text-[13.5px] font-black text-slate-900 dark:text-slate-50 mt-0.5">
                        {guide.title}
                      </Text>
                    </View>
                  </View>

                  <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={18} 
                    color="#94A3B8" 
                  />
                </TouchableOpacity>

                {/* Expanded Steps */}
                {isExpanded && (
                  <View className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 gap-2.5">
                    {guide.steps.map((step, idx) => (
                      <View key={idx} className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <Text className="text-xs font-black text-slate-800 dark:text-slate-100">
                          {step.title}
                        </Text>
                        <Text className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-5">
                          {step.desc}
                        </Text>
                      </View>
                    ))}

                    <TouchableOpacity
                      onPress={() => Linking.openURL('https://wa.me/918485877633?text=Hi,%20I%20have%20a%20question%20regarding%20' + encodeURIComponent(guide.title)).catch(() => {})}
                      style={{
                        height: 40,
                        borderRadius: 12,
                        overflow: 'hidden',
                        marginTop: 4,
                        elevation: 2,
                        shadowColor: '#10B981',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.25,
                        shadowRadius: 2
                      }}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={['#10B981', '#059669']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="w-full h-full flex-row items-center justify-center gap-1.5"
                      >
                        <Ionicons name="logo-whatsapp" size={15} color="#FFF" />
                        <Text className="text-xs font-black text-white">
                          Ask Help Regarding This Guide
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
