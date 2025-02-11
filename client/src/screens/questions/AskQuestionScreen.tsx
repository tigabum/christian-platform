import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  Dimensions,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../api/axios';
import {User} from '../../types/user.ts';

const {width} = Dimensions.get('window');

const AskQuestionScreen = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [responders, setResponders] = useState<User[]>([]);
  const [selectedResponder, setSelectedResponder] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingResponders, setFetchingResponders] = useState(true);
  const [showResponderModal, setShowResponderModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchResponders();
  }, []);

  const fetchResponders = async () => {
    try {
      const response = await api.get('/users/responders');
      setResponders(response.data);
    } catch (error) {
      console.error('Error fetching responders:', error);
    } finally {
      setFetchingResponders(false);
    }
  };

  const filteredResponders = responders.filter(responder =>
    responder.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    try {
      setLoading(true);
      const questionResponse = await api.post('/questions', {
        title: title.trim(),
        content: content.trim(),
        isAnonymous,
      });

      if (selectedResponder) {
        await api.patch(`/questions/${questionResponse.data._id}/assign`, {
          responderId: selectedResponder._id,
        });
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error creating question:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset search when modal closes
  const handleCloseModal = () => {
    setShowResponderModal(false);
    setSearchQuery(''); // Clear search when modal closes
  };

  const ResponderModal = () => (
    <Modal
      visible={showResponderModal}
      animationType="slide"
      presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Responder</Text>
          <TouchableOpacity onPress={handleCloseModal}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search responders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={filteredResponders}
          keyExtractor={item => item._id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.responderItem,
                selectedResponder?._id === item._id &&
                  styles.selectedResponderItem,
              ]}
              onPress={() => {
                setSelectedResponder(item);
                setShowResponderModal(false);
              }}>
              <View style={styles.responderInfo}>
                <Text style={styles.responderName}>{item.name}</Text>
                <Text style={styles.responderExpertise}>
                  {Array.isArray(item.expertise)
                    ? item.expertise.join(', ')
                    : item.expertise}
                </Text>
              </View>
              {selectedResponder?._id === item._id && (
                <Icon name="checkmark-circle" size={24} color="#007AFF" />
              )}
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="What's your question about?"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.contentInput}
          placeholder="Provide more details about your question..."
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.card}>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Ask Anonymously</Text>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={isAnonymous ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.responderSection}>
          <Text style={styles.sectionTitle}>Select Responder (Optional)</Text>
          <TouchableOpacity
            style={styles.responderSelector}
            onPress={() => setShowResponderModal(true)}>
            {selectedResponder ? (
              <Text style={styles.selectedResponderText}>
                {selectedResponder.name}
              </Text>
            ) : (
              <Text style={styles.responderPlaceholder}>
                Choose a responder...
              </Text>
            )}
            <Icon name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          (!title.trim() || !content.trim() || loading) &&
            styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!title.trim() || !content.trim() || loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Question</Text>
        )}
      </TouchableOpacity>

      <ResponderModal />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  titleInput: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  contentInput: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    minHeight: 120,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  responderSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  responderSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  selectedResponderText: {
    fontSize: 16,
    color: '#333',
  },
  responderPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    margin: 16,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  responderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedResponderItem: {
    backgroundColor: '#f0f8ff',
  },
  responderInfo: {
    flex: 1,
  },
  responderName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  responderExpertise: {
    fontSize: 14,
    color: '#666',
  },
});

export default AskQuestionScreen;
